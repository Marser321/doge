-- Customer guide, appointment change requests and request ↔ area links.
--
-- 1. `client_preferences` keeps the interactive guide state on the account, so
--    it follows the customer across devices. It lives outside `clients` to keep
--    the audited commercial record free of UI noise.
-- 2. `appointment_change_requests` lets a customer ask to schedule, move or
--    cancel a visit. Staff keep the final say: scheduling still goes through
--    `schedule_appointment` / `reschedule_appointment` and their team checks.
-- 3. `link_request_areas` finally writes `service_request_areas`, which is what
--    lets `transition_service_request` reset an area to 100% on completion.
-- 4. A signed-in booking can target one of the customer's existing properties
--    instead of always creating a new one.

begin;

-- ── Guide preferences ─────────────────────────────────────────────────
create table public.client_preferences (
  client_id uuid primary key references public.clients(id) on delete cascade,
  guide_enabled boolean not null default true,
  -- { "<step id>": "<ISO timestamp>" } for every completed step.
  guide_progress jsonb not null default '{}'::jsonb
    check (jsonb_typeof(guide_progress) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger client_preferences_set_updated_at before update on public.client_preferences
  for each row execute function private.set_updated_at();

alter table public.client_preferences enable row level security;
revoke all on table public.client_preferences from anon, authenticated;
grant select, insert, update on public.client_preferences to authenticated;

create policy client_preferences_self_read on public.client_preferences for select to authenticated
  using (client_id = private.current_client_id());
create policy client_preferences_self_insert on public.client_preferences for insert to authenticated
  with check (client_id = private.current_client_id());
create policy client_preferences_self_update on public.client_preferences for update to authenticated
  using (client_id = private.current_client_id())
  with check (client_id = private.current_client_id());
create policy client_preferences_staff_read on public.client_preferences for select to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));

-- ── Appointment change requests ───────────────────────────────────────
create type public.appointment_change_kind as enum ('schedule', 'reschedule', 'cancel');
create type public.appointment_change_status as enum ('pending', 'approved', 'declined', 'withdrawn');

create table public.appointment_change_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  service_request_id uuid not null references public.service_requests(id) on delete restrict,
  -- Null when the request had no active appointment yet (a "schedule" ask).
  appointment_id uuid references public.appointments(id) on delete restrict,
  kind public.appointment_change_kind not null,
  preferred_date date,
  preferred_window text check (preferred_window in ('morning', 'afternoon', 'flexible')),
  reason text check (reason is null or char_length(reason) <= 1000),
  status public.appointment_change_status not null default 'pending',
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  resolution_note text check (resolution_note is null or char_length(resolution_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (kind = 'cancel' or preferred_date is not null),
  check (kind <> 'cancel' or nullif(btrim(reason), '') is not null)
);

create unique index appointment_change_one_pending
  on public.appointment_change_requests(service_request_id) where status = 'pending';
create index appointment_change_client_idx
  on public.appointment_change_requests(client_id, created_at desc);
create index appointment_change_pending_idx
  on public.appointment_change_requests(created_at) where status = 'pending';

create trigger appointment_change_requests_set_updated_at before update on public.appointment_change_requests
  for each row execute function private.set_updated_at();
create trigger appointment_change_requests_audit after insert or update on public.appointment_change_requests
  for each row execute function private.audit_row_change();

alter table public.appointment_change_requests enable row level security;
revoke all on table public.appointment_change_requests from anon, authenticated;
-- Reads only: every write goes through the RPCs below.
grant select on public.appointment_change_requests to authenticated;

create policy appointment_changes_client_read on public.appointment_change_requests for select to authenticated
  using (client_id = private.current_client_id());
create policy appointment_changes_staff_read on public.appointment_change_requests for select to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));

-- ── Customer: ask for a change ────────────────────────────────────────
create or replace function public.request_appointment_change(
  p_request_id uuid,
  p_kind public.appointment_change_kind,
  p_preferred_date date default null,
  p_preferred_window text default null,
  p_reason text default null
)
returns public.appointment_change_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_client uuid;
  target_request public.service_requests;
  active_appointment public.appointments;
  effective_kind public.appointment_change_kind;
  created_change public.appointment_change_requests;
begin
  caller_client := private.current_client_id();
  if caller_client is null then
    raise exception 'No autorizado: la cuenta no tiene una ficha de cliente.';
  end if;

  select * into target_request from public.service_requests
  where id = p_request_id and client_id = caller_client and archived_at is null
  for update;
  if not found then raise exception 'Solicitud no encontrada'; end if;
  if target_request.status in ('completed', 'cancelled', 'in_progress') then
    raise exception 'Esta limpieza no admite cambios.';
  end if;

  select * into active_appointment from public.appointments
  where service_request_id = p_request_id and status = 'scheduled';

  -- The server decides between schedule and reschedule; only cancel is explicit.
  effective_kind := case
    when p_kind = 'cancel' then 'cancel'::public.appointment_change_kind
    when active_appointment.id is not null then 'reschedule'::public.appointment_change_kind
    else 'schedule'::public.appointment_change_kind
  end;

  if active_appointment.id is not null and active_appointment.starts_at < now() + interval '24 hours' then
    raise exception 'El cambio no se puede solicitar con menos de 24 horas de anticipación. Escríbenos para urgencias.';
  end if;

  if effective_kind <> 'cancel' then
    if p_preferred_date is null
      or p_preferred_date <= (now() at time zone 'America/New_York')::date
    then
      raise exception 'La fecha preferida es inválida: debe ser posterior a hoy.';
    end if;
    if coalesce(p_preferred_window, 'flexible') not in ('morning', 'afternoon', 'flexible') then
      raise exception 'La franja horaria es inválida.';
    end if;
  elsif nullif(btrim(p_reason), '') is null then
    raise exception 'La cancelación requiere un motivo.';
  end if;

  if exists (
    select 1 from public.appointment_change_requests
    where service_request_id = p_request_id and status = 'pending'
  ) then
    raise exception 'Ya hay un cambio pendiente para esta limpieza; no se puede enviar otro.';
  end if;

  insert into public.appointment_change_requests (
    client_id, service_request_id, appointment_id, kind,
    preferred_date, preferred_window, reason
  ) values (
    caller_client, p_request_id, active_appointment.id, effective_kind,
    case when effective_kind = 'cancel' then null else p_preferred_date end,
    case when effective_kind = 'cancel' then null else coalesce(p_preferred_window, 'flexible') end,
    nullif(btrim(p_reason), '')
  )
  returning * into created_change;

  insert into public.request_activity (service_request_id, action, metadata)
  values (
    p_request_id, 'appointment.change_requested',
    jsonb_build_object(
      'change_id', created_change.id,
      'kind', effective_kind,
      'preferred_date', created_change.preferred_date,
      'preferred_window', created_change.preferred_window,
      'source', 'customer'
    )
  );

  if target_request.contact_email is not null then
    insert into public.email_outbox (event_key, template, recipient, locale, payload)
    values (
      'appointment-change-received:' || created_change.id::text,
      'appointment-change-received',
      target_request.contact_email,
      target_request.locale,
      jsonb_build_object(
        'name', target_request.contact_name,
        'reference', target_request.reference_code,
        'service', target_request.service_name_snapshot,
        'kind', effective_kind,
        'preferredDate', created_change.preferred_date
      )
    ) on conflict (event_key) do nothing;
  end if;

  return created_change;
end;
$$;

revoke all on function public.request_appointment_change(uuid, public.appointment_change_kind, date, text, text) from public, anon, authenticated;
grant execute on function public.request_appointment_change(uuid, public.appointment_change_kind, date, text, text) to authenticated;

-- ── Customer: withdraw their own pending change ───────────────────────
create or replace function public.withdraw_appointment_change(p_change_id uuid)
returns public.appointment_change_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_client uuid;
  target_change public.appointment_change_requests;
begin
  caller_client := private.current_client_id();
  if caller_client is null then
    raise exception 'No autorizado: la cuenta no tiene una ficha de cliente.';
  end if;
  update public.appointment_change_requests
  set status = 'withdrawn', resolved_at = now()
  where id = p_change_id and client_id = caller_client and status = 'pending'
  returning * into target_change;
  if not found then raise exception 'La solicitud de cambio ya no está disponible.'; end if;
  return target_change;
end;
$$;

revoke all on function public.withdraw_appointment_change(uuid) from public, anon, authenticated;
grant execute on function public.withdraw_appointment_change(uuid) to authenticated;

-- ── Staff: resolve a change ───────────────────────────────────────────
-- Approving a schedule/reschedule with a slot books it atomically through the
-- existing RPCs, so team capacity and shift checks still apply. Approving
-- without a slot records the decision and leaves the booking to the calendar.
create or replace function public.resolve_appointment_change(
  p_change_id uuid,
  p_decision public.appointment_change_status,
  p_note text default null,
  p_team_id uuid default null,
  p_starts_at timestamptz default null,
  p_ends_at timestamptz default null
)
returns public.appointment_change_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_change public.appointment_change_requests;
  target_request public.service_requests;
  active_appointment public.appointments;
begin
  if not private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if p_decision not in ('approved', 'declined') then
    raise exception 'Decisión inválida.';
  end if;
  if p_decision = 'declined' and nullif(btrim(p_note), '') is null then
    raise exception 'El rechazo requiere un motivo.';
  end if;

  select * into target_change from public.appointment_change_requests
  where id = p_change_id for update;
  if not found or target_change.status <> 'pending' then
    raise exception 'La solicitud de cambio ya no está disponible.';
  end if;
  select * into target_request from public.service_requests where id = target_change.service_request_id;

  if p_decision = 'approved' then
    if target_change.kind = 'cancel' then
      perform public.transition_service_request(
        target_change.service_request_id, 'cancelled',
        coalesce(nullif(btrim(p_note), ''), target_change.reason)
      );
    elsif p_team_id is not null and p_starts_at is not null and p_ends_at is not null then
      select * into active_appointment from public.appointments
      where service_request_id = target_change.service_request_id and status = 'scheduled';
      if active_appointment.id is not null then
        perform public.reschedule_appointment(active_appointment.id, p_team_id, p_starts_at, p_ends_at, p_note);
      else
        perform public.schedule_appointment(target_change.service_request_id, p_team_id, p_starts_at, p_ends_at, p_note);
      end if;
    end if;
  end if;

  update public.appointment_change_requests
  set status = p_decision,
      resolved_by = (select auth.uid()),
      resolved_at = now(),
      resolution_note = nullif(btrim(p_note), '')
  where id = p_change_id
  returning * into target_change;

  insert into public.request_activity (service_request_id, actor_id, action, note, metadata)
  values (
    target_change.service_request_id, (select auth.uid()), 'appointment.change_resolved',
    target_change.resolution_note,
    jsonb_build_object('change_id', target_change.id, 'decision', p_decision, 'kind', target_change.kind)
  );

  if target_request.contact_email is not null then
    insert into public.email_outbox (event_key, template, recipient, locale, payload)
    values (
      'appointment-change-resolved:' || target_change.id::text,
      'appointment-change-resolved',
      target_request.contact_email,
      target_request.locale,
      jsonb_build_object(
        'name', target_request.contact_name,
        'reference', target_request.reference_code,
        'service', target_request.service_name_snapshot,
        'decision', p_decision,
        'note', target_change.resolution_note
      )
    ) on conflict (event_key) do nothing;
  end if;

  perform private.write_audit(
    'appointment_change.resolved', 'appointment_change_requests', target_change.id::text,
    jsonb_build_object('decision', p_decision)
  );
  return target_change;
end;
$$;

revoke all on function public.resolve_appointment_change(uuid, public.appointment_change_status, text, uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.resolve_appointment_change(uuid, public.appointment_change_status, text, uuid, timestamptz, timestamptz) to authenticated;

-- ── Link areas to a request ───────────────────────────────────────────
-- Replaces the request's area set. The owning customer may do it while the
-- service is still open; dispatch may do it at any point before completion.
create or replace function public.link_request_areas(p_request_id uuid, p_area_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_request public.service_requests;
  wanted uuid[];
  valid_count integer;
begin
  select * into target_request from public.service_requests
  where id = p_request_id and archived_at is null
  for update;
  if not found then raise exception 'Solicitud no encontrada'; end if;

  if not (
    private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[])
    or target_request.client_id = private.current_client_id()
  ) then
    raise exception 'No tienes permiso para modificar esta solicitud.';
  end if;
  if target_request.status in ('completed', 'cancelled') then
    raise exception 'Esta limpieza no admite cambios.';
  end if;

  wanted := array(select distinct unnest(coalesce(p_area_ids, '{}'::uuid[])));
  select count(*) into valid_count
  from public.property_areas
  where id = any(wanted) and property_id = target_request.property_id and archived_at is null;
  if valid_count <> coalesce(array_length(wanted, 1), 0) then
    raise exception 'Los espacios no pertenecen a la propiedad de esta limpieza.';
  end if;

  delete from public.service_request_areas
  where service_request_id = p_request_id and not (property_area_id = any(wanted));
  insert into public.service_request_areas (service_request_id, property_area_id)
  select p_request_id, area_id from unnest(wanted) as area_id
  on conflict do nothing;

  return valid_count;
end;
$$;

revoke all on function public.link_request_areas(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.link_request_areas(uuid, uuid[]) to authenticated, service_role;

-- ── Signed-in booking can reuse an existing property ──────────────────
-- Body is 202610010001's version verbatim except the property branch: when
-- the input carries `property_id` and it belongs to the resolved client, the
-- request is filed against it instead of creating a duplicate property.
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

  if p_auth_user_id is not null and selected_client.auth_user_id is null then
    update public.clients set auth_user_id = p_auth_user_id
    where id = selected_client.id
      and not exists (
        select 1 from public.clients other where other.auth_user_id = p_auth_user_id
      )
    returning * into selected_client;
  end if;

  -- Only an authenticated owner can target an existing property.
  if p_auth_user_id is not null
    and selected_client.auth_user_id = p_auth_user_id
    and nullif(p_input ->> 'property_id', '') is not null
  then
    select * into selected_property from public.properties
    where id = (p_input ->> 'property_id')::uuid
      and client_id = selected_client.id
      and archived_at is null;
  end if;

  if selected_property.id is null then
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
  end if;

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

  return jsonb_build_object(
    'reference', generated_reference,
    'requestId', created_request.id,
    'propertyId', selected_property.id
  );
end;
$$;

revoke all on function public.create_public_service_request(jsonb, text[], uuid) from public, anon, authenticated;
grant execute on function public.create_public_service_request(jsonb, text[], uuid) to service_role;

commit;
