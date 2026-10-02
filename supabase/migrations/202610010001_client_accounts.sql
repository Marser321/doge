-- Client accounts: a signed-in customer owns and reads their own records.
--
-- Until now `clients` had no link to `auth.users`: signup created the auth user
-- and a client row that could never be matched again, `/account` redirected to
-- `/login`, and no RLS policy let a customer read anything of their own.
-- Every policy added here is additive; staff policies are left untouched.

begin;

-- ── Link ──────────────────────────────────────────────────────────────
alter table public.clients
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists clients_auth_user_unique
  on public.clients(auth_user_id) where auth_user_id is not null;

-- Resolving the caller's client row inside a policy must not re-enter RLS on
-- public.clients, so this mirrors private.has_any_role: security definer,
-- stable, empty search_path.
create or replace function private.current_client_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.clients
  where auth_user_id = (select auth.uid())
    and archived_at is null
$$;

-- ── Commercial columns stay in staff hands ────────────────────────────
-- Staff and customers share the `authenticated` role, so a column-level grant
-- cannot tell them apart and an RLS policy cannot restrict columns at all.
-- The foundation already grants UPDATE on all of `clients`, which would let a
-- customer promote their own `segment` to 'vip' through PostgREST. A trigger is
-- the only place that distinction can be enforced.
create or replace function private.guard_client_self_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Only PostgREST sessions run as `authenticated`. Service-role calls and
  -- security-definer RPCs (signup linking, booking adoption) run as another
  -- role and must pass through untouched, or account linking breaks.
  if current_user <> 'authenticated' then
    return new;
  end if;
  if private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]) then
    return new;
  end if;
  -- Customer writing their own row: pin the columns they do not own.
  new.segment := old.segment;
  new.lifetime_value_cents := old.lifetime_value_cents;
  new.auth_user_id := old.auth_user_id;
  new.email := old.email;
  new.archived_at := old.archived_at;
  return new;
end;
$$;

create trigger clients_guard_self_update
  before update on public.clients
  for each row execute function private.guard_client_self_update();

-- ── Policies ──────────────────────────────────────────────────────────
create policy client_self_read on public.clients for select to authenticated
  using (auth_user_id = (select auth.uid()));
create policy client_self_update on public.clients for update to authenticated
  using (auth_user_id = (select auth.uid()))
  with check (auth_user_id = (select auth.uid()));

create policy client_own_properties_read on public.properties for select to authenticated
  using (client_id = private.current_client_id());
create policy client_own_properties_insert on public.properties for insert to authenticated
  with check (client_id = private.current_client_id());
create policy client_own_properties_update on public.properties for update to authenticated
  using (client_id = private.current_client_id())
  with check (client_id = private.current_client_id());

create policy client_own_requests_read on public.service_requests for select to authenticated
  using (client_id = private.current_client_id());
create policy client_own_quotes_read on public.quotes for select to authenticated
  using (exists (
    select 1 from public.service_requests sr
    where sr.id = quotes.service_request_id and sr.client_id = private.current_client_id()
  ));
-- Plans are public catalogue data: the membership page reads them before the
-- customer has any subscription at all.
create policy plans_read_any_signed_in on public.subscription_plans for select to authenticated
  using (is_active = true);

create policy client_own_subscriptions_read on public.subscriptions for select to authenticated
  using (client_id = private.current_client_id());
create policy client_own_orders_read on public.orders for select to authenticated
  using (client_id = private.current_client_id());
create policy client_own_appointments_read on public.appointments for select to authenticated
  using (exists (
    select 1 from public.service_requests sr
    where sr.id = appointments.service_request_id and sr.client_id = private.current_client_id()
  ));

-- ── Booking links to the account when there is a session ──────────────
-- Body is the original function verbatim; the only changes are the optional
-- p_auth_user_id and the adoption branch. With a null argument the anonymous
-- path behaves exactly as before.
create or replace function public.create_public_service_request(
  p_input jsonb,
  p_attachment_keys text[] default '{}'::text[],
  p_auth_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_client public.clients;
  selected_property public.properties;
  selected_service public.service_catalog;
  created_request public.service_requests;
  attachment_key text;
  generated_reference text;
  normalized_email extensions.citext;
begin
  if coalesce((p_input ->> 'consent')::boolean, false) is not true then
    raise exception 'El consentimiento es obligatorio';
  end if;
  if nullif(btrim(p_input ->> 'name'), '') is null
    or nullif(btrim(p_input ->> 'address'), '') is null
    or nullif(btrim(p_input ->> 'city'), '') is null
    or nullif(btrim(p_input ->> 'property_type'), '') is null
  then
    raise exception 'La solicitud está incompleta';
  end if;
  normalized_email := lower(nullif(btrim(p_input ->> 'email'), ''))::extensions.citext;
  if normalized_email is null then raise exception 'Email is required'; end if;

  select * into selected_client
  from public.clients where email = normalized_email and archived_at is null
  for update;

  if not found then
    insert into public.clients (name, email, phone, locale, auth_user_id)
    values (
      btrim(p_input ->> 'name'), normalized_email,
      nullif(btrim(p_input ->> 'phone'), ''),
      coalesce(nullif(p_input ->> 'locale', ''), 'es'),
      p_auth_user_id
    )
    on conflict (email) where email is not null and archived_at is null
    do nothing
    returning * into selected_client;
    if not found then
      select * into selected_client
      from public.clients
      where email = normalized_email and archived_at is null
      for update;
    end if;
  end if;

  -- A signed-in booking adopts the client record that anonymous bookings created
  -- for this email, so the account inherits its own history.
  if p_auth_user_id is not null and selected_client.auth_user_id is null then
    update public.clients set auth_user_id = p_auth_user_id
    where id = selected_client.id
      and not exists (
        select 1 from public.clients other where other.auth_user_id = p_auth_user_id
      )
    returning * into selected_client;
  end if;

  insert into public.properties (
    client_id, address, city, property_type, square_feet, bedrooms, bathrooms
  ) values (
    selected_client.id, btrim(p_input ->> 'address'), btrim(p_input ->> 'city'),
    btrim(p_input ->> 'property_type'),
    nullif(p_input ->> 'square_feet', '')::integer,
    nullif(p_input ->> 'bedrooms', '')::integer,
    nullif(p_input ->> 'bathrooms', '')::numeric
  )
  returning * into selected_property;

  select * into selected_service
  from public.service_catalog
  where code = nullif(p_input ->> 'service_code', '') and is_active = true;
  if not found then raise exception 'Servicio no disponible'; end if;

  generated_reference := 'DOGE-' || to_char(now() at time zone 'America/New_York', 'YYYYMMDD')
    || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.service_requests (
    reference_code, client_id, property_id, service_id, service_name_snapshot,
    contact_name, contact_email, contact_phone, locale, source, status,
    preferred_date, notes
  ) values (
    generated_reference, selected_client.id, selected_property.id, selected_service.id,
    case when coalesce(nullif(p_input ->> 'locale', ''), 'es') = 'en'
      then selected_service.name_en else selected_service.name_es end,
    btrim(p_input ->> 'name'), normalized_email, nullif(btrim(p_input ->> 'phone'), ''),
    coalesce(nullif(p_input ->> 'locale', ''), 'es'), 'website', 'new',
    nullif(p_input ->> 'preferred_date', '')::date, nullif(btrim(p_input ->> 'notes'), '')
  )
  returning * into created_request;

  foreach attachment_key in array coalesce(p_attachment_keys, '{}'::text[]) loop
    insert into public.request_attachments (
      service_request_id, bucket, object_key, kind
    ) values (created_request.id, 'booking-attachments', attachment_key, 'intake');
  end loop;

  insert into public.request_activity (service_request_id, action, to_status, metadata)
  values (created_request.id, 'request.created', 'new', jsonb_build_object('source', 'website'));

  insert into public.email_outbox (event_key, template, recipient, locale, payload)
  values (
    'request-received:' || created_request.id::text,
    'request-received',
    normalized_email,
    created_request.locale,
    jsonb_build_object(
      'name', created_request.contact_name,
      'reference', generated_reference,
      'service', created_request.service_name_snapshot
    )
  ) on conflict (event_key) do nothing;

  return jsonb_build_object('reference', generated_reference, 'requestId', created_request.id);
end;
$$;

revoke all on function public.create_public_service_request(jsonb, text[], uuid) from public, anon, authenticated;
grant execute on function public.create_public_service_request(jsonb, text[], uuid) to service_role;
-- Drop the two-argument original so the overload cannot be called by mistake.
drop function if exists public.create_public_service_request(jsonb, text[]);

commit;
