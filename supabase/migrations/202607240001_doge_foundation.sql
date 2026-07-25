-- DOGE CRM: clean Supabase foundation.
-- All application tables are private by default and are accessed through the
-- Next.js BFF with a user-scoped client. Public ingestion uses service_role.

create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.staff_role as enum ('owner', 'manager', 'dispatcher', 'crew');
create type public.request_status as enum (
  'new', 'reviewing', 'quoted', 'approved', 'scheduled',
  'in_progress', 'completed', 'cancelled'
);
create type public.quote_status as enum ('draft', 'sent', 'accepted', 'declined', 'expired');
create type public.appointment_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
create type public.subscription_status as enum ('pending', 'active', 'paused', 'cancelled');
create type public.product_sale_type as enum ('own_stock', 'amazon_affiliate', 'whatsapp_concierge');
create type public.intent_status as enum ('new', 'contacted', 'converted', 'lost');
create type public.order_status as enum ('draft', 'confirmed', 'fulfilled', 'cancelled', 'refunded');
create type public.payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');
create type public.inventory_movement_type as enum ('receipt', 'sale', 'adjustment', 'return');
create type public.email_status as enum ('pending', 'processing', 'sent', 'failed', 'suppressed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email extensions.citext not null unique,
  display_name text,
  phone text,
  role public.staff_role not null default 'crew',
  locale text not null default 'es' check (locale in ('es', 'en')),
  is_active boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  capacity_size integer not null default 1 check (capacity_size > 0),
  is_active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  starts_on date not null default current_date,
  ends_on date,
  created_at timestamptz not null default now(),
  primary key (team_id, profile_id, starts_on),
  check (ends_on is null or ends_on >= starts_on)
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email extensions.citext,
  phone text,
  billing_address text,
  segment text not null default 'standard' check (segment in ('standard', 'vip', 'corporate')),
  locale text not null default 'es' check (locale in ('es', 'en')),
  notes text,
  lifetime_value_cents bigint not null default 0 check (lifetime_value_cents >= 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  label text,
  address text not null,
  city text not null,
  region text not null default 'FL',
  postal_code text,
  property_type text not null,
  square_feet integer check (square_feet is null or square_feet > 0),
  bedrooms integer check (bedrooms is null or bedrooms >= 0),
  bathrooms numeric(4,1) check (bathrooms is null or bathrooms >= 0),
  access_notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_catalog (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name_es text not null,
  name_en text not null,
  description_es text,
  description_en text,
  default_duration_minutes integer not null default 120 check (default_duration_minutes between 15 and 1440),
  base_price_cents bigint not null default 0 check (base_price_cents >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  cadence_days integer not null check (cadence_days between 1 and 366),
  base_price_cents bigint not null default 0 check (base_price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  status public.subscription_status not null default 'pending',
  cadence_days integer not null check (cadence_days between 1 and 366),
  preferred_weekday smallint check (preferred_weekday is null or preferred_weekday between 0 and 6),
  next_occurrence_date date,
  started_on date not null default current_date,
  ended_on date,
  monthly_value_cents bigint not null default 0 check (monthly_value_cents >= 0),
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ended_on is null or ended_on >= started_on),
  check (status <> 'active' or next_occurrence_date is not null)
);

create table public.subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  service_id uuid not null references public.service_catalog(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_cents bigint not null default 0 check (unit_price_cents >= 0),
  estimated_duration_minutes integer not null default 120 check (estimated_duration_minutes between 15 and 1440),
  created_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  client_id uuid not null references public.clients(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  service_id uuid references public.service_catalog(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  subscription_item_id uuid references public.subscription_items(id) on delete set null,
  occurrence_date date,
  service_name_snapshot text not null,
  contact_name text not null,
  contact_email extensions.citext,
  contact_phone text,
  locale text not null default 'es' check (locale in ('es', 'en')),
  source text not null default 'admin' check (source in ('website', 'admin', 'subscription', 'commerce')),
  status public.request_status not null default 'new',
  preferred_date date,
  required_team_size integer not null default 1 check (required_team_size > 0),
  notes text,
  cancellation_reason text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index service_request_subscription_occurrence_unique
  on public.service_requests(subscription_item_id, occurrence_date)
  where subscription_item_id is not null and occurrence_date is not null;

create table public.request_attachments (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  bucket text not null,
  object_key text not null unique,
  kind text not null default 'intake' check (kind in ('intake', 'before', 'after', 'incident')),
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.request_activity (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  from_status public.request_status,
  to_status public.request_status,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text not null unique,
  service_request_id uuid not null references public.service_requests(id) on delete restrict,
  status public.quote_status not null default 'draft',
  currency char(3) not null default 'USD',
  subtotal_cents bigint not null default 0 check (subtotal_cents >= 0),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  tax_cents bigint not null default 0 check (tax_cents >= 0),
  total_cents bigint not null default 0 check (total_cents >= 0),
  tax_basis_points integer not null default 0 check (tax_basis_points between 0 and 10000),
  notes text,
  access_token_hash text,
  expires_at timestamptz,
  sent_at timestamptz,
  decided_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index quotes_access_token_hash_unique
  on public.quotes(access_token_hash) where access_token_hash is not null;

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  service_id uuid references public.service_catalog(id) on delete set null,
  description text not null,
  quantity numeric(10,2) not null default 1 check (quantity > 0),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  total_cents bigint not null check (total_cents >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete restrict,
  property_id uuid not null references public.properties(id) on delete restrict,
  team_id uuid not null references public.teams(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  notes text,
  incident_notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  exclude using gist (
    team_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status <> 'cancelled')
);

create unique index appointments_active_request_unique
  on public.appointments(service_request_id)
  where status <> 'cancelled';

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  brand text,
  tagline text,
  description text,
  detailed_description text,
  price_cents bigint not null check (price_cents >= 0),
  compare_at_price_cents bigint check (compare_at_price_cents is null or compare_at_price_cents >= 0),
  cost_price_cents bigint check (cost_price_cents is null or cost_price_cents >= 0),
  sale_type public.product_sale_type not null default 'own_stock',
  affiliate_url text,
  affiliate_asin text,
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  category text,
  benefit_label text,
  accent_gradient text,
  specs jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  object_key text,
  image_url text not null,
  alt_text text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.inventory_levels (
  product_id uuid primary key references public.products(id) on delete restrict,
  on_hand integer not null default 0 check (on_hand >= 0),
  updated_at timestamptz not null default now()
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  quantity_delta integer not null check (quantity_delta <> 0),
  movement_type public.inventory_movement_type not null,
  reference_type text,
  reference_id uuid,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  code text not null unique,
  discount_basis_points integer check (discount_basis_points between 0 and 10000),
  discount_cents bigint not null default 0 check (discount_cents >= 0),
  applies_to text not null default 'both' check (applies_to in ('services', 'products', 'both')),
  max_uses integer check (max_uses is null or max_uses > 0),
  usage_count integer not null default 0 check (usage_count >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  client_id uuid references public.clients(id) on delete set null,
  intent_id uuid,
  customer_name text not null,
  customer_email extensions.citext,
  customer_phone text,
  delivery_address text,
  channel text not null default 'concierge' check (channel in ('concierge', 'whatsapp', 'admin')),
  status public.order_status not null default 'draft',
  payment_status public.payment_status not null default 'unpaid',
  currency char(3) not null default 'USD',
  subtotal_cents bigint not null default 0,
  discount_cents bigint not null default 0,
  total_cents bigint not null default 0,
  offer_id uuid references public.offers(id) on delete set null,
  notes text,
  inventory_applied_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (subtotal_cents >= 0),
  check (discount_cents >= 0 and discount_cents <= subtotal_cents),
  check (total_cents = subtotal_cents - discount_cents)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sale_type public.product_sale_type not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  total_cents bigint not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.commerce_intents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  client_id uuid references public.clients(id) on delete set null,
  channel text not null check (channel in ('whatsapp', 'affiliate')),
  source text not null default 'store',
  contact_name text,
  contact_email extensions.citext,
  contact_phone text,
  status public.intent_status not null default 'new',
  affiliate_reference text,
  commission_cents bigint check (commission_cents is null or commission_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add constraint orders_intent_id_fkey foreign key (intent_id)
  references public.commerce_intents(id) on delete set null;

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email extensions.citext,
  action text not null,
  entity_type text not null,
  entity_id text,
  request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  template text not null,
  recipient extensions.citext not null,
  locale text not null default 'es' check (locale in ('es', 'en')),
  payload jsonb not null default '{}'::jsonb,
  status public.email_status not null default 'pending',
  attempts integer not null default 0 check (attempts >= 0),
  next_attempt_at timestamptz not null default now(),
  provider_id text,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id text not null unique,
  outbox_id uuid references public.email_outbox(id) on delete set null,
  provider_id text,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table public.rate_limit_windows (
  bucket text not null,
  identity_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1 check (request_count > 0),
  expires_at timestamptz not null,
  primary key (bucket, identity_hash, window_started_at)
);

create table public.api_idempotency_keys (
  key_hash text primary key,
  scope text not null,
  actor_subject text not null,
  request_hash text not null,
  response_status integer,
  response_body jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '24 hours',
  check (
    (response_status is null and response_body is null)
    or (response_status between 200 and 599 and response_body is not null)
  )
);

create index properties_client_idx on public.properties(client_id, created_at desc);
create unique index clients_active_email_unique on public.clients(email)
  where email is not null and archived_at is null;
create index requests_pipeline_idx on public.service_requests(status, created_at desc) where archived_at is null;
create index requests_client_idx on public.service_requests(client_id, created_at desc);
create index attachments_request_idx on public.request_attachments(service_request_id, created_at);
create index activity_request_idx on public.request_activity(service_request_id, created_at desc);
create index quotes_request_idx on public.quotes(service_request_id, created_at desc);
create index appointments_team_time_idx on public.appointments(team_id, starts_at, ends_at);
create index appointments_request_idx on public.appointments(service_request_id);
create unique index products_active_slug_unique on public.products(slug)
  where archived_at is null;
create index shifts_profile_time_idx on public.shifts(profile_id, starts_at, ends_at);
create index subscriptions_due_idx on public.subscriptions(status, next_occurrence_date);
create index inventory_movements_product_idx on public.inventory_movements(product_id, created_at desc);
create index orders_status_idx on public.orders(status, created_at desc);
create index intents_pipeline_idx on public.commerce_intents(status, created_at desc);
create index audit_entity_idx on public.audit_events(entity_type, entity_id, created_at desc);
create index email_outbox_due_idx on public.email_outbox(status, next_attempt_at);
create index rate_limit_expiry_idx on public.rate_limit_windows(expires_at);
create index api_idempotency_expiry_idx on public.api_idempotency_keys(expires_at);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'teams', 'clients', 'properties', 'service_catalog',
    'subscription_plans', 'subscriptions', 'service_requests', 'quotes',
    'appointments', 'products', 'inventory_levels', 'offers', 'orders',
    'commerce_intents', 'email_outbox'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name, table_name
    );
  end loop;
end;
$$;

create or replace function private.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_email_value extensions.citext;
  entity_id_value text;
begin
  select email into actor_email_value
  from public.profiles
  where id = (select auth.uid());
  entity_id_value := coalesce(
    to_jsonb(new) ->> 'id',
    to_jsonb(new) ->> 'product_id',
    to_jsonb(new) ->> 'service_request_id',
    to_jsonb(new) ->> 'team_id'
  );
  insert into public.audit_events (
    actor_id, actor_email, action, entity_type, entity_id, metadata
  ) values (
    (select auth.uid()),
    actor_email_value,
    lower(tg_table_name || '.' || tg_op),
    tg_table_name,
    entity_id_value,
    jsonb_build_object('operation', lower(tg_op))
  );
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'teams', 'team_members', 'shifts', 'clients', 'properties',
    'service_catalog', 'subscription_plans', 'subscriptions', 'subscription_items',
    'service_requests', 'quotes', 'appointments', 'products', 'product_images',
    'offers', 'orders', 'order_items', 'commerce_intents'
  ] loop
    execute format(
      'create trigger %I_audit after insert or update on public.%I for each row execute function private.audit_row_change()',
      table_name, table_name
    );
  end loop;
end;
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, role, is_active)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    'crew',
    false
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.current_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
    and is_active = true
    and archived_at is null
    and (
      role not in ('owner', 'manager')
      or coalesce((select auth.jwt() ->> 'aal'), 'aal1') = 'aal2'
    )
$$;

create or replace function private.has_any_role(allowed public.staff_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_role() = any(allowed), false)
$$;

create or replace function private.is_assigned_to_request(target_request uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.appointments a
    join public.team_members tm on tm.team_id = a.team_id
    where a.service_request_id = target_request
      and tm.profile_id = (select auth.uid())
      and tm.starts_on <= (a.starts_at at time zone 'America/New_York')::date
      and (tm.ends_on is null or tm.ends_on >= (a.starts_at at time zone 'America/New_York')::date)
  )
$$;

create or replace function private.write_audit(
  event_action text,
  event_entity_type text,
  event_entity_id text,
  event_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_email_value extensions.citext;
begin
  select email into actor_email_value from public.profiles where id = (select auth.uid());
  insert into public.audit_events (
    actor_id, actor_email, action, entity_type, entity_id, metadata
  ) values (
    (select auth.uid()), actor_email_value, event_action, event_entity_type,
    event_entity_id, coalesce(event_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function public.consume_rate_limit(
  p_bucket text,
  p_identity_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  window_start timestamptz;
  resulting_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit configuration';
  end if;
  delete from public.rate_limit_windows
  where bucket = p_bucket
    and identity_hash = p_identity_hash
    and expires_at < now();
  window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  insert into public.rate_limit_windows (
    bucket, identity_hash, window_started_at, request_count, expires_at
  ) values (
    p_bucket, p_identity_hash, window_start, 1,
    window_start + make_interval(secs => p_window_seconds)
  )
  on conflict (bucket, identity_hash, window_started_at)
  do update set request_count = public.rate_limit_windows.request_count + 1
  returning request_count into resulting_count;
  return resulting_count <= p_limit;
end;
$$;

create or replace function public.create_public_service_request(
  p_input jsonb,
  p_attachment_keys text[] default '{}'::text[]
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
    insert into public.clients (name, email, phone, locale)
    values (
      btrim(p_input ->> 'name'), normalized_email,
      nullif(btrim(p_input ->> 'phone'), ''),
      coalesce(nullif(p_input ->> 'locale', ''), 'es')
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

create or replace function public.transition_service_request(
  p_request_id uuid,
  p_status public.request_status,
  p_note text default null
)
returns public.service_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_request public.service_requests;
  actor_role public.staff_role;
  previous_status public.request_status;
begin
  actor_role := private.current_role();
  select * into current_request from public.service_requests where id = p_request_id for update;
  if not found then raise exception 'Solicitud no encontrada'; end if;

  if actor_role = 'crew' then
    if not private.is_assigned_to_request(p_request_id)
      or not (
        (current_request.status = 'scheduled' and p_status = 'in_progress') or
        (current_request.status = 'in_progress' and p_status = 'completed')
      )
    then raise exception 'Transición no permitida para la cuadrilla'; end if;
  elsif actor_role not in ('owner', 'manager', 'dispatcher') then
    raise exception 'Rol no autorizado';
  end if;

  if p_status = 'cancelled' and nullif(btrim(p_note), '') is null then
    raise exception 'La cancelación requiere un motivo';
  end if;

  if p_status <> 'cancelled' and not (
    (current_request.status = 'new' and p_status = 'reviewing') or
    (current_request.status = 'reviewing' and p_status = 'quoted') or
    (current_request.status = 'quoted' and p_status = 'approved') or
    (current_request.status = 'approved' and p_status = 'scheduled') or
    (current_request.status = 'scheduled' and p_status = 'in_progress') or
    (current_request.status = 'in_progress' and p_status = 'completed')
  ) then
    raise exception 'Transición de solicitud no válida';
  end if;

  previous_status := current_request.status;
  update public.service_requests
  set status = p_status,
      cancellation_reason = case when p_status = 'cancelled' then btrim(p_note) else cancellation_reason end
  where id = p_request_id
  returning * into current_request;

  update public.appointments
  set status = case
      when p_status = 'in_progress' then 'in_progress'::public.appointment_status
      when p_status = 'completed' then 'completed'::public.appointment_status
      when p_status = 'cancelled' then 'cancelled'::public.appointment_status
      else status
    end,
    started_at = case when p_status = 'in_progress' then coalesce(started_at, now()) else started_at end,
    completed_at = case when p_status = 'completed' then coalesce(completed_at, now()) else completed_at end
  where service_request_id = p_request_id and status <> 'cancelled';

  insert into public.request_activity (
    service_request_id, actor_id, action, from_status, to_status, note
  ) values (
    p_request_id, (select auth.uid()), 'request.status_changed',
    previous_status,
    p_status, p_note
  );
  if p_status = 'cancelled' and current_request.contact_email is not null then
    insert into public.email_outbox (event_key, template, recipient, locale, payload)
    values (
      'request-cancelled:' || current_request.id::text,
      'request-cancelled',
      current_request.contact_email,
      current_request.locale,
      jsonb_build_object(
        'name', current_request.contact_name,
        'reference', current_request.reference_code,
        'service', current_request.service_name_snapshot,
        'reason', current_request.cancellation_reason
      )
    ) on conflict (event_key) do nothing;
  end if;
  perform private.write_audit(
    'service_request.status_changed', 'service_requests', p_request_id::text,
    jsonb_build_object('to', p_status, 'note', p_note)
  );
  return current_request;
end;
$$;

create or replace function public.available_teams(
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_required_size integer default 1
)
returns table (team_id uuid, team_name text, capacity_size integer)
language sql
stable
security definer
set search_path = ''
as $$
  select t.id, t.name, t.capacity_size
  from public.teams t
  where private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[])
    and t.is_active = true
    and t.archived_at is null
    and t.capacity_size >= p_required_size
    and (
      select count(distinct tm.profile_id)
      from public.team_members tm
      join public.profiles p on p.id = tm.profile_id and p.is_active = true and p.archived_at is null
      join public.shifts s on s.profile_id = tm.profile_id
        and s.starts_at <= p_starts_at and s.ends_at >= p_ends_at
      where tm.team_id = t.id
        and tm.starts_on <= (p_starts_at at time zone 'America/New_York')::date
        and (tm.ends_on is null or tm.ends_on >= (p_starts_at at time zone 'America/New_York')::date)
    ) >= p_required_size
    and not exists (
      select 1 from public.appointments a
      where a.team_id = t.id
        and a.status <> 'cancelled'
        and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
    )
  order by t.name
$$;

create or replace function public.schedule_appointment(
  p_request_id uuid,
  p_team_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_notes text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_request public.service_requests;
  target_team public.teams;
  created_appointment public.appointments;
  available_member_count integer;
begin
  if not private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if p_ends_at <= p_starts_at then raise exception 'Horario inválido'; end if;

  select * into target_request from public.service_requests where id = p_request_id for update;
  if not found or target_request.status not in ('approved', 'scheduled') then
    raise exception 'La solicitud debe estar aprobada';
  end if;
  select * into target_team from public.teams where id = p_team_id and is_active = true for update;
  if not found or target_team.capacity_size < target_request.required_team_size then
    raise exception 'El equipo no tiene capacidad suficiente';
  end if;
  select count(distinct tm.profile_id) into available_member_count
  from public.team_members tm
  join public.profiles p on p.id = tm.profile_id and p.is_active = true and p.archived_at is null
  join public.shifts s on s.profile_id = tm.profile_id
    and s.starts_at <= p_starts_at and s.ends_at >= p_ends_at
  where tm.team_id = p_team_id
    and tm.starts_on <= (p_starts_at at time zone 'America/New_York')::date
    and (tm.ends_on is null or tm.ends_on >= (p_starts_at at time zone 'America/New_York')::date);
  if available_member_count < target_request.required_team_size then
    raise exception 'El equipo no tiene suficientes integrantes de turno';
  end if;

  insert into public.appointments (
    service_request_id, property_id, team_id, starts_at, ends_at, notes, created_by
  ) values (
    target_request.id, target_request.property_id, p_team_id,
    p_starts_at, p_ends_at, nullif(btrim(p_notes), ''), (select auth.uid())
  ) returning * into created_appointment;

  update public.service_requests set status = 'scheduled' where id = p_request_id;
  insert into public.request_activity (
    service_request_id, actor_id, action, from_status, to_status, metadata
  ) values (
    p_request_id, (select auth.uid()), 'appointment.scheduled',
    target_request.status, 'scheduled',
    jsonb_build_object('appointment_id', created_appointment.id, 'team_id', p_team_id)
  );
  if target_request.contact_email is not null then
    insert into public.email_outbox (event_key, template, recipient, locale, payload)
    values (
      'appointment-scheduled:' || created_appointment.id::text,
      'appointment-scheduled',
      target_request.contact_email,
      target_request.locale,
      jsonb_build_object(
        'name', target_request.contact_name,
        'reference', target_request.reference_code,
        'startsAt', p_starts_at,
        'service', target_request.service_name_snapshot
      )
    ) on conflict (event_key) do nothing;
  end if;
  perform private.write_audit('appointment.created', 'appointments', created_appointment.id::text, '{}'::jsonb);
  return created_appointment;
end;
$$;

create or replace function public.reschedule_appointment(
  p_appointment_id uuid,
  p_team_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_notes text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_appointment public.appointments;
  target_request public.service_requests;
  target_team public.teams;
  available_member_count integer;
begin
  if not private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if p_ends_at <= p_starts_at then raise exception 'Horario inválido'; end if;
  select * into current_appointment from public.appointments
  where id = p_appointment_id and status = 'scheduled'
  for update;
  if not found then raise exception 'La cita no se puede reprogramar'; end if;
  select * into target_request from public.service_requests
  where id = current_appointment.service_request_id
  for update;
  select * into target_team from public.teams
  where id = p_team_id and is_active = true and archived_at is null
  for update;
  if not found or target_team.capacity_size < target_request.required_team_size then
    raise exception 'El equipo no tiene capacidad suficiente';
  end if;
  select count(distinct tm.profile_id) into available_member_count
  from public.team_members tm
  join public.profiles p on p.id = tm.profile_id and p.is_active = true and p.archived_at is null
  join public.shifts s on s.profile_id = tm.profile_id
    and s.starts_at <= p_starts_at and s.ends_at >= p_ends_at
  where tm.team_id = p_team_id
    and tm.starts_on <= (p_starts_at at time zone 'America/New_York')::date
    and (tm.ends_on is null or tm.ends_on >= (p_starts_at at time zone 'America/New_York')::date);
  if available_member_count < target_request.required_team_size then
    raise exception 'El equipo no tiene suficientes integrantes de turno';
  end if;
  update public.appointments
  set team_id = p_team_id,
      starts_at = p_starts_at,
      ends_at = p_ends_at,
      notes = coalesce(nullif(btrim(p_notes), ''), notes)
  where id = p_appointment_id
  returning * into current_appointment;
  insert into public.request_activity (
    service_request_id, actor_id, action, metadata
  ) values (
    target_request.id,
    (select auth.uid()),
    'appointment.rescheduled',
    jsonb_build_object(
      'appointment_id', p_appointment_id,
      'team_id', p_team_id,
      'starts_at', p_starts_at,
      'ends_at', p_ends_at
    )
  );
  if target_request.contact_email is not null then
    insert into public.email_outbox (event_key, template, recipient, locale, payload)
    values (
      'appointment-rescheduled:' || p_appointment_id::text || ':' || extract(epoch from p_starts_at)::bigint::text,
      'appointment-rescheduled',
      target_request.contact_email,
      target_request.locale,
      jsonb_build_object(
        'name', target_request.contact_name,
        'reference', target_request.reference_code,
        'startsAt', p_starts_at,
        'service', target_request.service_name_snapshot
      )
    ) on conflict (event_key) do nothing;
  end if;
  perform private.write_audit('appointment.rescheduled', 'appointments', p_appointment_id::text, jsonb_build_object('starts_at', p_starts_at));
  return current_appointment;
end;
$$;

create or replace function public.create_quote_with_items(
  p_request_id uuid,
  p_items jsonb,
  p_discount_cents bigint default 0,
  p_tax_basis_points integer default 0,
  p_notes text default null,
  p_access_token_hash text default null,
  p_approval_url text default null
)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_request public.service_requests;
  created_quote public.quotes;
  item jsonb;
  item_total bigint;
  subtotal bigint := 0;
  tax_value bigint := 0;
  total_value bigint := 0;
  generated_number text;
begin
  if not private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La cotización requiere conceptos';
  end if;
  if p_discount_cents < 0 or p_tax_basis_points not between 0 and 10000 then
    raise exception 'Importes inválidos';
  end if;
  select * into target_request from public.service_requests where id = p_request_id for update;
  if not found or target_request.status not in ('reviewing', 'quoted') then
    raise exception 'La solicitud no admite cotización';
  end if;

  for item in select value from jsonb_array_elements(p_items) loop
    item_total := round(
      coalesce((item ->> 'quantity')::numeric, 1) *
      coalesce((item ->> 'unit_price_cents')::bigint, 0)
    );
    if item_total < 0 then raise exception 'Importe de concepto inválido'; end if;
    subtotal := subtotal + item_total;
  end loop;
  if p_discount_cents > subtotal then raise exception 'Descuento inválido'; end if;
  tax_value := round((subtotal - p_discount_cents) * p_tax_basis_points / 10000.0);
  total_value := subtotal - p_discount_cents + tax_value;
  generated_number := 'Q-' || to_char(now() at time zone 'America/New_York', 'YYYYMMDD')
    || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.quotes (
    quote_number, service_request_id, status, subtotal_cents, discount_cents,
    tax_cents, total_cents, tax_basis_points, notes, access_token_hash,
    expires_at, sent_at, created_by
  ) values (
    generated_number, p_request_id,
    case when p_access_token_hash is null then 'draft' else 'sent' end,
    subtotal, p_discount_cents, tax_value, total_value, p_tax_basis_points,
    nullif(btrim(p_notes), ''), p_access_token_hash,
    case when p_access_token_hash is null then null else now() + interval '14 days' end,
    case when p_access_token_hash is null then null else now() end,
    (select auth.uid())
  ) returning * into created_quote;

  for item in select value from jsonb_array_elements(p_items) loop
    item_total := round(
      coalesce((item ->> 'quantity')::numeric, 1) *
      coalesce((item ->> 'unit_price_cents')::bigint, 0)
    );
    insert into public.quote_items (
      quote_id, service_id, description, quantity, unit_price_cents, total_cents, sort_order
    ) values (
      created_quote.id, nullif(item ->> 'service_id', '')::uuid,
      btrim(item ->> 'description'), coalesce((item ->> 'quantity')::numeric, 1),
      coalesce((item ->> 'unit_price_cents')::bigint, 0), item_total,
      coalesce((item ->> 'sort_order')::integer, 0)
    );
  end loop;

  update public.service_requests
  set status = case when p_access_token_hash is null then 'reviewing' else 'quoted' end
  where id = p_request_id;
  insert into public.request_activity (
    service_request_id, actor_id, action, from_status, to_status, metadata
  ) values (
    p_request_id, (select auth.uid()), 'quote.created', target_request.status,
    case when p_access_token_hash is null then 'reviewing' else 'quoted' end,
    jsonb_build_object('quote_id', created_quote.id, 'total_cents', total_value)
  );
  if p_access_token_hash is not null and p_approval_url is not null and target_request.contact_email is not null then
    insert into public.email_outbox (event_key, template, recipient, locale, payload)
    values (
      'quote-ready:' || created_quote.id::text,
      'quote-ready',
      target_request.contact_email,
      target_request.locale,
      jsonb_build_object(
        'name', target_request.contact_name,
        'reference', target_request.reference_code,
        'service', target_request.service_name_snapshot,
        'approvalUrl', p_approval_url
      )
    ) on conflict (event_key) do nothing;
  end if;
  perform private.write_audit('quote.created', 'quotes', created_quote.id::text, jsonb_build_object('total_cents', total_value));
  return created_quote;
end;
$$;

create or replace function public.decide_quote(
  p_access_token_hash text,
  p_decision text
)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_quote public.quotes;
  target_request public.service_requests;
begin
  if p_decision not in ('accepted', 'declined') then raise exception 'Decisión inválida'; end if;
  select * into target_quote
  from public.quotes
  where access_token_hash = p_access_token_hash
  for update;
  if not found or target_quote.status <> 'sent' or target_quote.expires_at <= now() then
    raise exception 'La cotización no está disponible';
  end if;
  update public.quotes
  set status = p_decision::public.quote_status, decided_at = now(), access_token_hash = null
  where id = target_quote.id returning * into target_quote;
  update public.service_requests
  set status = case when p_decision = 'accepted' then 'approved' else 'cancelled' end,
      cancellation_reason = case when p_decision = 'declined' then 'Cotización rechazada por el cliente' else cancellation_reason end
  where id = target_quote.service_request_id
  returning * into target_request;
  insert into public.request_activity (
    service_request_id, action, from_status, to_status, metadata
  ) values (
    target_request.id, 'quote.' || p_decision, 'quoted', target_request.status,
    jsonb_build_object('quote_id', target_quote.id)
  );
  insert into public.email_outbox (event_key, template, recipient, locale, payload)
  values (
    'quote-decision:' || target_quote.id::text,
    'quote-decision',
    target_request.contact_email,
    target_request.locale,
    jsonb_build_object(
      'name', target_request.contact_name,
      'reference', target_request.reference_code,
      'decision', p_decision,
      'quoteNumber', target_quote.quote_number
    )
  ) on conflict (event_key) do nothing;
  return target_quote;
end;
$$;

create or replace function public.adjust_inventory(
  p_product_id uuid,
  p_quantity_delta integer,
  p_movement_type public.inventory_movement_type,
  p_note text
)
returns public.inventory_levels
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_level public.inventory_levels;
begin
  if not private.has_any_role(array['owner','manager']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if p_quantity_delta = 0 or nullif(btrim(p_note), '') is null then
    raise exception 'El ajuste requiere cantidad y motivo';
  end if;
  insert into public.inventory_levels (product_id, on_hand)
  values (p_product_id, 0) on conflict (product_id) do nothing;
  select * into current_level from public.inventory_levels where product_id = p_product_id for update;
  if current_level.on_hand + p_quantity_delta < 0 then raise exception 'Stock insuficiente'; end if;
  update public.inventory_levels
  set on_hand = on_hand + p_quantity_delta
  where product_id = p_product_id returning * into current_level;
  insert into public.inventory_movements (
    product_id, quantity_delta, movement_type, note, actor_id
  ) values (
    p_product_id, p_quantity_delta, p_movement_type, btrim(p_note), (select auth.uid())
  );
  perform private.write_audit('inventory.adjusted', 'products', p_product_id::text, jsonb_build_object('delta', p_quantity_delta));
  return current_level;
end;
$$;

create or replace function public.create_product_with_inventory(
  p_product jsonb,
  p_initial_stock integer default 0
)
returns public.products
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_product public.products;
begin
  if not private.has_any_role(array['owner','manager']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if p_initial_stock < 0 then raise exception 'Inventario inicial inválido'; end if;
  insert into public.products (
    name, slug, brand, tagline, description, detailed_description,
    price_cents, compare_at_price_cents, cost_price_cents, sale_type,
    affiliate_url, affiliate_asin, low_stock_threshold, category,
    benefit_label, accent_gradient, specs, is_active, is_featured, sort_order
  ) values (
    btrim(p_product ->> 'name'),
    btrim(p_product ->> 'slug'),
    nullif(btrim(p_product ->> 'brand'), ''),
    nullif(btrim(p_product ->> 'tagline'), ''),
    nullif(btrim(p_product ->> 'description'), ''),
    nullif(btrim(p_product ->> 'detailed_description'), ''),
    coalesce((p_product ->> 'price_cents')::bigint, 0),
    nullif(p_product ->> 'compare_at_price_cents', '')::bigint,
    nullif(p_product ->> 'cost_price_cents', '')::bigint,
    coalesce(nullif(p_product ->> 'sale_type', '')::public.product_sale_type, 'own_stock'),
    nullif(btrim(p_product ->> 'affiliate_url'), ''),
    nullif(btrim(p_product ->> 'affiliate_asin'), ''),
    coalesce((p_product ->> 'low_stock_threshold')::integer, 5),
    nullif(btrim(p_product ->> 'category'), ''),
    nullif(btrim(p_product ->> 'benefit_label'), ''),
    nullif(btrim(p_product ->> 'accent_gradient'), ''),
    coalesce(p_product -> 'specs', '[]'::jsonb),
    coalesce((p_product ->> 'is_active')::boolean, true),
    coalesce((p_product ->> 'is_featured')::boolean, false),
    coalesce((p_product ->> 'sort_order')::integer, 0)
  ) returning * into created_product;
  if created_product.sale_type = 'own_stock' then
    insert into public.inventory_levels (product_id, on_hand)
    values (created_product.id, p_initial_stock);
    if p_initial_stock > 0 then
      insert into public.inventory_movements (
        product_id, quantity_delta, movement_type, note, actor_id
      ) values (
        created_product.id, p_initial_stock, 'receipt', 'Inventario inicial', (select auth.uid())
      );
    end if;
  elsif p_initial_stock > 0 then
    raise exception 'Los productos afiliados o concierge no administran stock';
  end if;
  perform private.write_audit('product.created', 'products', created_product.id::text, jsonb_build_object('initial_stock', p_initial_stock));
  return created_product;
end;
$$;

create or replace function public.create_order_with_items(
  p_order jsonb,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_order public.orders;
  item jsonb;
  selected_product public.products;
  requested_quantity integer;
  subtotal_value bigint := 0;
  generated_number text;
  requested_status public.order_status;
  selected_offer public.offers;
  discount_value bigint := 0;
begin
  if not private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La orden requiere productos';
  end if;
  requested_status := coalesce(nullif(p_order ->> 'status', '')::public.order_status, 'draft');
  if requested_status not in ('draft', 'confirmed') then raise exception 'Estado inicial inválido'; end if;
  generated_number := 'DOGE-' || to_char(now() at time zone 'America/New_York', 'YYYYMMDD')
    || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    order_number, client_id, intent_id, customer_name, customer_email,
    customer_phone, delivery_address, channel, status, payment_status,
    notes, offer_id, created_by, inventory_applied_at
  ) values (
    generated_number, nullif(p_order ->> 'client_id', '')::uuid,
    nullif(p_order ->> 'intent_id', '')::uuid,
    coalesce(nullif(btrim(p_order ->> 'customer_name'), ''), 'Cliente concierge'),
    nullif(lower(btrim(p_order ->> 'customer_email')), '')::extensions.citext,
    nullif(btrim(p_order ->> 'customer_phone'), ''),
    nullif(btrim(p_order ->> 'delivery_address'), ''),
    coalesce(nullif(p_order ->> 'channel', ''), 'concierge'),
    requested_status,
    coalesce(nullif(p_order ->> 'payment_status', '')::public.payment_status, 'unpaid'),
    nullif(btrim(p_order ->> 'notes'), ''),
    nullif(p_order ->> 'offer_id', '')::uuid,
    (select auth.uid()),
    case when requested_status = 'confirmed' then now() else null end
  ) returning * into created_order;

  for item in select value from jsonb_array_elements(p_items) loop
    requested_quantity := coalesce((item ->> 'quantity')::integer, 1);
    if requested_quantity < 1 then raise exception 'Cantidad inválida'; end if;
    select * into selected_product
    from public.products
    where id = (item ->> 'product_id')::uuid and archived_at is null and is_active = true
    for update;
    if not found then raise exception 'Producto no encontrado'; end if;

    if requested_status = 'confirmed' and selected_product.sale_type = 'own_stock' then
      insert into public.inventory_levels (product_id, on_hand)
      values (selected_product.id, 0) on conflict (product_id) do nothing;
      perform 1 from public.inventory_levels where product_id = selected_product.id for update;
      if (select on_hand from public.inventory_levels where product_id = selected_product.id) < requested_quantity then
        raise exception 'Stock insuficiente para %', selected_product.name;
      end if;
      update public.inventory_levels set on_hand = on_hand - requested_quantity
      where product_id = selected_product.id;
      insert into public.inventory_movements (
        product_id, quantity_delta, movement_type, reference_type, reference_id, note, actor_id
      ) values (
        selected_product.id, -requested_quantity, 'sale', 'order', created_order.id,
        'Orden confirmada', (select auth.uid())
      );
    end if;

    insert into public.order_items (
      order_id, product_id, product_name, sale_type, quantity, unit_price_cents, total_cents
    ) values (
      created_order.id, selected_product.id, selected_product.name, selected_product.sale_type,
      requested_quantity, selected_product.price_cents, selected_product.price_cents * requested_quantity
    );
    subtotal_value := subtotal_value + selected_product.price_cents * requested_quantity;
  end loop;

  if created_order.offer_id is not null then
    select * into selected_offer from public.offers
    where id = created_order.offer_id
      and is_active = true
      and applies_to in ('products', 'both')
      and (starts_at is null or starts_at <= now())
      and (expires_at is null or expires_at > now())
      and (max_uses is null or usage_count < max_uses)
    for update;
    if not found then raise exception 'La oferta no está disponible'; end if;
    discount_value := least(
      subtotal_value,
      case
        when selected_offer.discount_basis_points is not null
          then round(subtotal_value * selected_offer.discount_basis_points / 10000.0)
        else selected_offer.discount_cents
      end
    );
    if requested_status = 'confirmed' then
      update public.offers set usage_count = usage_count + 1 where id = selected_offer.id;
    end if;
  end if;

  update public.orders
  set subtotal_cents = subtotal_value,
      discount_cents = discount_value,
      total_cents = subtotal_value - discount_value
  where id = created_order.id returning * into created_order;
  if created_order.intent_id is not null then
    update public.commerce_intents set status = 'converted' where id = created_order.intent_id;
  end if;
  perform private.write_audit('order.created', 'orders', created_order.id::text, jsonb_build_object('total_cents', subtotal_value));
  return created_order;
end;
$$;

create or replace function public.transition_order(
  p_order_id uuid,
  p_status public.order_status
)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_order public.orders;
  order_item public.order_items;
  level_value integer;
begin
  if not private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  select * into target_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Orden no encontrada'; end if;
  if not (
    (target_order.status = 'draft' and p_status in ('confirmed','cancelled')) or
    (target_order.status = 'confirmed' and p_status in ('fulfilled','cancelled')) or
    (target_order.status = 'fulfilled' and p_status = 'refunded')
  ) then raise exception 'Transición de orden no válida'; end if;

  if target_order.status = 'draft' and p_status = 'confirmed' then
    if target_order.offer_id is not null then
      perform 1 from public.offers
      where id = target_order.offer_id
        and is_active = true
        and applies_to in ('products', 'both')
        and (starts_at is null or starts_at <= now())
        and (expires_at is null or expires_at > now())
        and (max_uses is null or usage_count < max_uses)
      for update;
      if not found then raise exception 'La oferta ya no está disponible'; end if;
      update public.offers set usage_count = usage_count + 1 where id = target_order.offer_id;
    end if;
    for order_item in select * from public.order_items where order_id = p_order_id loop
      if order_item.sale_type = 'own_stock' then
        insert into public.inventory_levels (product_id, on_hand)
        values (order_item.product_id, 0) on conflict (product_id) do nothing;
        select on_hand into level_value from public.inventory_levels
        where product_id = order_item.product_id for update;
        if level_value < order_item.quantity then raise exception 'Stock insuficiente para %', order_item.product_name; end if;
        update public.inventory_levels set on_hand = on_hand - order_item.quantity
        where product_id = order_item.product_id;
        insert into public.inventory_movements (
          product_id, quantity_delta, movement_type, reference_type, reference_id, note, actor_id
        ) values (
          order_item.product_id, -order_item.quantity, 'sale', 'order', p_order_id,
          'Orden confirmada', (select auth.uid())
        );
      end if;
    end loop;
    update public.orders set inventory_applied_at = now() where id = p_order_id;
  elsif target_order.status = 'confirmed' and p_status = 'cancelled' and target_order.inventory_applied_at is not null then
    for order_item in select * from public.order_items where order_id = p_order_id loop
      if order_item.sale_type = 'own_stock' then
        update public.inventory_levels set on_hand = on_hand + order_item.quantity
        where product_id = order_item.product_id;
        insert into public.inventory_movements (
          product_id, quantity_delta, movement_type, reference_type, reference_id, note, actor_id
        ) values (
          order_item.product_id, order_item.quantity, 'return', 'order', p_order_id,
          'Orden cancelada', (select auth.uid())
        );
      end if;
    end loop;
    if target_order.offer_id is not null then
      update public.offers set usage_count = greatest(0, usage_count - 1)
      where id = target_order.offer_id;
    end if;
  end if;
  if target_order.client_id is not null and target_order.status = 'confirmed' and p_status = 'fulfilled' then
    update public.clients
    set lifetime_value_cents = lifetime_value_cents + target_order.total_cents
    where id = target_order.client_id;
  elsif target_order.client_id is not null and target_order.status = 'fulfilled' and p_status = 'refunded' then
    update public.clients
    set lifetime_value_cents = greatest(0, lifetime_value_cents - target_order.total_cents)
    where id = target_order.client_id;
  end if;
  update public.orders set status = p_status where id = p_order_id returning * into target_order;
  perform private.write_audit('order.status_changed', 'orders', p_order_id::text, jsonb_build_object('to', p_status));
  return target_order;
end;
$$;

create or replace function public.generate_subscription_requests(p_horizon_days integer default 30)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  subscription_row public.subscriptions;
  item_row public.subscription_items;
  property_row public.properties;
  client_row public.clients;
  service_row public.service_catalog;
  occurrence date;
  generated_count integer := 0;
  business_today date := (now() at time zone 'America/New_York')::date;
begin
  if p_horizon_days not between 1 and 90 then raise exception 'Horizonte inválido'; end if;
  for subscription_row in
    select * from public.subscriptions
    where status = 'active' and next_occurrence_date is not null and archived_at is null
    for update
  loop
    occurrence := subscription_row.next_occurrence_date;
    select * into property_row from public.properties where id = subscription_row.property_id;
    select * into client_row from public.clients where id = subscription_row.client_id;
    while occurrence <= business_today + p_horizon_days loop
      for item_row in select * from public.subscription_items where subscription_id = subscription_row.id loop
        select * into service_row from public.service_catalog where id = item_row.service_id;
        insert into public.service_requests (
          reference_code, client_id, property_id, service_id, subscription_id,
          subscription_item_id, occurrence_date, service_name_snapshot,
          contact_name, contact_email, contact_phone, locale, source, status,
          preferred_date
        ) values (
          'DOGE-R-' || to_char(occurrence, 'YYYYMMDD') || '-' ||
            upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
          client_row.id, property_row.id, service_row.id, subscription_row.id,
          item_row.id, occurrence, service_row.name_es, client_row.name,
          client_row.email, client_row.phone, client_row.locale,
          'subscription', 'approved', occurrence
        ) on conflict (subscription_item_id, occurrence_date) where
          subscription_item_id is not null and occurrence_date is not null
        do nothing;
        if found then generated_count := generated_count + 1; end if;
      end loop;
      occurrence := occurrence + subscription_row.cadence_days;
    end loop;
    update public.subscriptions set next_occurrence_date = occurrence
    where id = subscription_row.id;
  end loop;
  return generated_count;
end;
$$;

create or replace function public.create_subscription_with_item(
  p_client_id uuid,
  p_property_id uuid,
  p_plan_id uuid,
  p_service_id uuid,
  p_status public.subscription_status,
  p_monthly_value_cents bigint,
  p_started_on date,
  p_next_occurrence_date date,
  p_preferred_weekday smallint default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_plan public.subscription_plans;
  target_service public.service_catalog;
  new_subscription_id uuid;
begin
  if not private.has_any_role(array['owner','manager']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if p_monthly_value_cents < 0 or p_started_on is null then
    raise exception 'Datos económicos o fecha de inicio inválidos';
  end if;
  if p_status = 'active' and (
    p_next_occurrence_date is null
    or p_next_occurrence_date < p_started_on
    or p_next_occurrence_date < (now() at time zone 'America/New_York')::date
  ) then
    raise exception 'La suscripción activa requiere una próxima ocurrencia válida';
  end if;
  if p_preferred_weekday is not null and p_preferred_weekday not between 0 and 6 then
    raise exception 'El día preferido no es válido';
  end if;
  if not exists (
    select 1 from public.properties where id = p_property_id and client_id = p_client_id and archived_at is null
  ) then raise exception 'La propiedad no pertenece al cliente'; end if;
  select * into target_plan from public.subscription_plans where id = p_plan_id and is_active = true;
  select * into target_service from public.service_catalog where id = p_service_id and is_active = true;
  if target_plan.id is null or target_service.id is null then raise exception 'Plan o servicio inválido'; end if;
  insert into public.subscriptions (
    client_id, property_id, plan_id, status, cadence_days, preferred_weekday,
    next_occurrence_date, started_on, monthly_value_cents
  ) values (
    p_client_id, p_property_id, p_plan_id, p_status, target_plan.cadence_days,
    p_preferred_weekday, p_next_occurrence_date, p_started_on, p_monthly_value_cents
  ) returning id into new_subscription_id;
  insert into public.subscription_items (
    subscription_id, service_id, quantity, unit_price_cents, estimated_duration_minutes
  ) values (
    new_subscription_id, p_service_id, 1, p_monthly_value_cents,
    target_service.default_duration_minutes
  );
  perform private.write_audit('subscription.created', 'subscriptions', new_subscription_id::text, '{}'::jsonb);
  return new_subscription_id;
end;
$$;

create or replace function public.update_staff_profile(
  p_profile_id uuid,
  p_role public.staff_role default null,
  p_is_active boolean default null,
  p_display_name text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_profile public.profiles;
begin
  if private.current_role() <> 'owner' then raise exception 'Rol no autorizado'; end if;
  if p_profile_id = (select auth.uid())
    and (p_role is not null or p_is_active = false)
  then
    raise exception 'El owner no puede degradar ni desactivar su propia cuenta';
  end if;
  update public.profiles
  set role = coalesce(p_role, role),
      is_active = coalesce(p_is_active, is_active),
      display_name = coalesce(nullif(btrim(p_display_name), ''), display_name)
  where id = p_profile_id
  returning * into updated_profile;
  if not found then raise exception 'Perfil no encontrado'; end if;
  perform private.write_audit(
    'profile.updated',
    'profiles',
    p_profile_id::text,
    jsonb_build_object('role', updated_profile.role, 'is_active', updated_profile.is_active)
  );
  return updated_profile;
end;
$$;

create or replace function public.update_commerce_intent(
  p_intent_id uuid,
  p_status public.intent_status,
  p_affiliate_reference text,
  p_commission_cents bigint,
  p_include_affiliate boolean
)
returns public.commerce_intents
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role public.staff_role;
  target_intent public.commerce_intents;
begin
  actor_role := private.current_role();
  if actor_role not in ('owner', 'manager', 'dispatcher') then
    raise exception 'Rol no autorizado';
  end if;
  if p_include_affiliate and actor_role = 'dispatcher' then
    raise exception 'No tienes permiso para modificar datos financieros';
  end if;
  if p_commission_cents is not null and p_commission_cents < 0 then
    raise exception 'Comisión inválida';
  end if;
  select * into target_intent
  from public.commerce_intents
  where id = p_intent_id
  for update;
  if not found then raise exception 'Intención comercial no encontrada'; end if;
  if p_include_affiliate and target_intent.channel <> 'affiliate' then
    raise exception 'La intención no es de afiliado';
  end if;
  update public.commerce_intents
  set status = coalesce(p_status, status),
      affiliate_reference = case
        when p_include_affiliate then nullif(btrim(p_affiliate_reference), '')
        else affiliate_reference
      end,
      commission_cents = case
        when p_include_affiliate then p_commission_cents
        else commission_cents
      end
  where id = p_intent_id
  returning * into target_intent;
  perform private.write_audit(
    'commerce_intent.updated',
    'commerce_intents',
    p_intent_id::text,
    jsonb_build_object('status', target_intent.status, 'affiliate_updated', p_include_affiliate)
  );
  return target_intent;
end;
$$;

create or replace function public.claim_email_outbox(p_limit integer default 10)
returns setof public.email_outbox
language sql
security definer
set search_path = ''
as $$
  update public.email_outbox
  set status = 'processing',
      attempts = attempts + 1
  where id in (
    select id
    from public.email_outbox
    where (
      status in ('pending', 'failed') and next_attempt_at <= now()
    ) or (
      status = 'processing' and updated_at < now() - interval '15 minutes'
    )
    order by created_at
    for update skip locked
    limit greatest(1, least(p_limit, 50))
  )
  returning *
$$;

-- Row-level security
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles','teams','team_members','shifts','clients','properties',
    'service_catalog','subscription_plans','subscriptions','subscription_items',
    'service_requests','request_attachments','request_activity','quotes','quote_items',
    'appointments','products','product_images','inventory_levels','inventory_movements',
    'offers','orders','order_items','commerce_intents','audit_events','email_outbox',
    'email_deliveries','rate_limit_windows','api_idempotency_keys'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end;
$$;

grant usage on schema public to authenticated;
grant select on public.profiles, public.teams, public.team_members, public.shifts,
  public.clients, public.properties, public.service_catalog, public.subscription_plans,
  public.subscriptions, public.subscription_items, public.service_requests,
  public.request_attachments, public.request_activity, public.quotes, public.quote_items,
  public.appointments, public.products, public.product_images, public.inventory_levels,
  public.inventory_movements, public.offers, public.orders, public.order_items,
  public.commerce_intents, public.audit_events to authenticated;
grant insert, update on public.clients, public.properties, public.offers to authenticated;
grant update on public.products to authenticated;
grant update (status, monthly_value_cents, preferred_weekday, next_occurrence_date, ended_on)
  on public.subscriptions to authenticated;
grant insert, update on public.teams, public.team_members, public.shifts,
  public.service_catalog, public.subscription_plans to authenticated;

create policy profiles_self_read on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy profiles_management_read on public.profiles for select to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]));

create policy operations_staff_read on public.teams for select to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher','crew']::public.staff_role[]));
create policy operations_management_write on public.teams for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));
create policy team_members_staff_read on public.team_members for select to authenticated
  using (profile_id = (select auth.uid()) or private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy team_members_management_write on public.team_members for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));
create policy shifts_staff_read on public.shifts for select to authenticated
  using (profile_id = (select auth.uid()) or private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy shifts_operations_write on public.shifts for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));

create policy crm_staff_clients on public.clients for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy crew_assigned_client_read on public.clients for select to authenticated
  using (exists (
    select 1 from public.service_requests sr
    where sr.client_id = clients.id and private.is_assigned_to_request(sr.id)
  ));
create policy crm_staff_properties on public.properties for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy crew_assigned_property_read on public.properties for select to authenticated
  using (exists (
    select 1 from public.service_requests sr
    where sr.property_id = properties.id and private.is_assigned_to_request(sr.id)
  ));

create policy staff_service_catalog_read on public.service_catalog for select to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher','crew']::public.staff_role[]));
create policy managers_service_catalog_write on public.service_catalog for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));

create policy managers_subscription_plans on public.subscription_plans for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));
create policy managers_subscriptions on public.subscriptions for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));
create policy managers_subscription_items on public.subscription_items for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));

create policy operations_requests on public.service_requests for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy crew_assigned_requests on public.service_requests for select to authenticated
  using (private.is_assigned_to_request(id));
create policy request_attachments_staff on public.request_attachments for select to authenticated
  using (
    private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[])
    or private.is_assigned_to_request(service_request_id)
  );
create policy request_activity_staff on public.request_activity for select to authenticated
  using (
    private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[])
    or private.is_assigned_to_request(service_request_id)
  );

create policy operations_quotes on public.quotes for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy operations_quote_items on public.quote_items for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));

create policy operations_appointments on public.appointments for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy crew_assigned_appointments on public.appointments for select to authenticated
  using (private.is_assigned_to_request(service_request_id));

create policy staff_products_read on public.products for select to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy managers_products_write on public.products for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));
create policy staff_product_images_read on public.product_images for select to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy managers_product_images_write on public.product_images for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));
create policy staff_inventory_read on public.inventory_levels for select to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy staff_inventory_movements_read on public.inventory_movements for select to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy managers_offers on public.offers for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));
create policy dispatcher_offers_read on public.offers for select to authenticated
  using (private.has_any_role(array['dispatcher']::public.staff_role[]));
create policy commerce_orders on public.orders for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy commerce_order_items on public.order_items for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy commerce_intents_staff on public.commerce_intents for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy management_audit_read on public.audit_events for select to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]));

revoke all on all functions in schema public from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, text, integer, integer) to service_role;
grant execute on function public.create_public_service_request(jsonb, text[]) to service_role;
grant execute on function public.decide_quote(text, text) to service_role;
grant execute on function public.generate_subscription_requests(integer) to service_role;
grant execute on function public.claim_email_outbox(integer) to service_role;
grant execute on function public.transition_service_request(uuid, public.request_status, text) to authenticated;
grant execute on function public.available_teams(timestamptz, timestamptz, integer) to authenticated;
grant execute on function public.schedule_appointment(uuid, uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.reschedule_appointment(uuid, uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.create_quote_with_items(uuid, jsonb, bigint, integer, text, text, text) to authenticated;
grant execute on function public.adjust_inventory(uuid, integer, public.inventory_movement_type, text) to authenticated;
grant execute on function public.create_product_with_inventory(jsonb, integer) to authenticated;
grant execute on function public.create_order_with_items(jsonb, jsonb) to authenticated;
grant execute on function public.transition_order(uuid, public.order_status) to authenticated;
grant execute on function public.create_subscription_with_item(uuid, uuid, uuid, uuid, public.subscription_status, bigint, date, date, smallint) to authenticated;
grant execute on function public.update_staff_profile(uuid, public.staff_role, boolean, text) to authenticated;
grant execute on function public.update_commerce_intent(uuid, public.intent_status, text, bigint, boolean) to authenticated;

-- Buckets are created by migration so local, staging, and production match.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('booking-attachments', 'booking-attachments', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('job-evidence', 'job-evidence', false, 5242880, array['image/jpeg','image/png','image/webp']),
  ('product-media', 'product-media', true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy public_product_media_read on storage.objects for select to public
  using (bucket_id = 'product-media');
