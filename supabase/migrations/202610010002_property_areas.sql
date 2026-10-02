-- Property areas: the customer models their own spaces, and each one carries a
-- cleanliness level that decays linearly from the day it was last serviced.
--
-- The percentage itself is never stored: it is a pure function of elapsed time,
-- computed in `src/lib/cleanliness.ts` for the UI and inline here for the sweep.
-- Only threshold crossings need state, and email_outbox.event_key provides it.

begin;

-- ── Catalogue of area types (DOGE-owned, not customer editable) ───────
create table public.area_types (
  code text primary key,
  name_es text not null,
  name_en text not null,
  -- Full 100% -> 0% cycle. Fixed by DOGE so the signal stays comparable.
  decay_days integer not null check (decay_days between 1 and 365),
  measurement_kind text not null check (measurement_kind in ('sqft', 'window_count', 'unit')),
  -- Slugs from src/content/store-taxonomy.ts, used to suggest restocking.
  consumable_categories text[] not null default '{}'::text[],
  service_code text references public.service_catalog(code),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── The customer's own spaces ─────────────────────────────────────────
create table public.property_areas (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  area_type_code text not null references public.area_types(code),
  label text not null,
  measurement_value numeric(10,2) check (measurement_value is null or measurement_value > 0),
  requirements text,
  last_cleaned_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index property_areas_property_idx on public.property_areas(property_id, created_at desc);
create index property_areas_sweep_idx on public.property_areas(last_cleaned_at)
  where archived_at is null and last_cleaned_at is not null;

-- ── Which areas a request covers ──────────────────────────────────────
create table public.service_request_areas (
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  property_area_id uuid not null references public.property_areas(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (service_request_id, property_area_id)
);

-- ── Wire into the foundation's three cross-cutting loops ──────────────
create trigger area_types_set_updated_at before update on public.area_types
  for each row execute function private.set_updated_at();
create trigger property_areas_set_updated_at before update on public.property_areas
  for each row execute function private.set_updated_at();

create trigger area_types_audit after insert or update on public.area_types
  for each row execute function private.audit_row_change();
create trigger property_areas_audit after insert or update on public.property_areas
  for each row execute function private.audit_row_change();

do $$
declare
  table_name text;
begin
  foreach table_name in array array['area_types', 'property_areas', 'service_request_areas'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon, authenticated', table_name);
  end loop;
end;
$$;

grant select on public.area_types, public.property_areas, public.service_request_areas to authenticated;
grant insert, update on public.property_areas to authenticated;
grant insert, delete on public.service_request_areas to authenticated;
grant insert, update on public.area_types to authenticated;

-- ── Policies ──────────────────────────────────────────────────────────
-- The catalogue is readable by any signed-in user; only management writes it.
create policy area_types_read on public.area_types for select to authenticated using (true);
create policy area_types_management_write on public.area_types for all to authenticated
  using (private.has_any_role(array['owner','manager']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager']::public.staff_role[]));

create policy areas_staff on public.property_areas for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy areas_client_read on public.property_areas for select to authenticated
  using (exists (
    select 1 from public.properties p
    where p.id = property_areas.property_id and p.client_id = private.current_client_id()
  ));
create policy areas_client_insert on public.property_areas for insert to authenticated
  with check (exists (
    select 1 from public.properties p
    where p.id = property_areas.property_id and p.client_id = private.current_client_id()
  ));
create policy areas_client_update on public.property_areas for update to authenticated
  using (exists (
    select 1 from public.properties p
    where p.id = property_areas.property_id and p.client_id = private.current_client_id()
  ))
  with check (exists (
    select 1 from public.properties p
    where p.id = property_areas.property_id and p.client_id = private.current_client_id()
  ));

create policy request_areas_staff on public.service_request_areas for all to authenticated
  using (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]))
  with check (private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]));
create policy request_areas_client_read on public.service_request_areas for select to authenticated
  using (exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_areas.service_request_id
      and sr.client_id = private.current_client_id()
  ));

-- ── Seed the catalogue ────────────────────────────────────────────────
insert into public.area_types (code, name_es, name_en, decay_days, measurement_kind, consumable_categories, service_code, sort_order) values
  ('kitchen',     'Cocina',              'Kitchen',        21, 'sqft',         array['kitchen-cleaners','degreasers','disinfectants','paper-towels'], 'carpet-cleaning',  10),
  ('bathroom',    'Baño',                'Bathroom',       21, 'sqft',         array['bathroom-cleaners','disinfectants','toilet-paper','air-fresheners'], 'carpet-cleaning', 20),
  ('bedroom',     'Habitación',          'Bedroom',        45, 'sqft',         array['all-purpose-cleaners','floor-cleaners','air-fresheners'], 'carpet-cleaning',  30),
  ('living',      'Sala de estar',       'Living room',    35, 'sqft',         array['all-purpose-cleaners','floor-cleaners'], 'carpet-cleaning',  40),
  ('window-wall', 'Ventanal',            'Window wall',    60, 'window_count', array['glass-cleaners'], 'window-cleaning', 50),
  ('office',      'Oficina',             'Office',         30, 'sqft',         array['all-purpose-cleaners','disinfectants','paper-towels'], 'carpet-cleaning',  60),
  ('retail',      'Local comercial',     'Retail space',   30, 'sqft',         array['all-purpose-cleaners','floor-cleaners','trash-bags'], 'carpet-cleaning',  70),
  ('outdoor',     'Área exterior',       'Outdoor area',   90, 'sqft',         array['degreasers'], 'pressure-washing', 80),
  ('garage',      'Garaje',              'Garage',         90, 'sqft',         array['degreasers','floor-cleaners'], 'pressure-washing', 90)
on conflict (code) do update set
  name_es = excluded.name_es,
  name_en = excluded.name_en,
  decay_days = excluded.decay_days,
  measurement_kind = excluded.measurement_kind,
  consumable_categories = excluded.consumable_categories,
  service_code = excluded.service_code,
  sort_order = excluded.sort_order;

-- ── Completing a service resets its areas to 100% ─────────────────────
-- Body is the original function verbatim plus the reset block.
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

  -- Completing a service resets every area it covered back to 100% clean and
  -- re-arms the reminder thresholds for the next cycle.
  if p_status = 'completed' then
    update public.property_areas pa
    set last_cleaned_at = now()
    from public.service_request_areas sra
    where sra.service_request_id = p_request_id
      and sra.property_area_id = pa.id
      and pa.archived_at is null;
  end if;

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

-- ── Threshold sweep ───────────────────────────────────────────────────
-- Runs from the existing daily subscriptions cron. Vercel Hobby caps cron jobs,
-- so this deliberately does not add a third schedule.
create or replace function public.sweep_area_reminders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  area_row record;
  threshold integer;
  percent_now numeric;
  queued integer := 0;
begin
  for area_row in
    select pa.id, pa.label, pa.last_cleaned_at, pa.area_type_code,
           at.decay_days, at.name_es as type_es, at.name_en as type_en,
           at.consumable_categories, at.service_code,
           c.id as client_id, c.locale, c.email as recipient
    from public.property_areas pa
    join public.area_types at on at.code = pa.area_type_code
    join public.properties p on p.id = pa.property_id
    join public.clients c on c.id = p.client_id
    where pa.archived_at is null
      and pa.last_cleaned_at is not null
      and c.archived_at is null
      and c.email is not null
  loop
    -- Linear decay: 100% on the service day, 0% after decay_days.
    percent_now := greatest(0, 100 - (
      extract(epoch from (now() - area_row.last_cleaned_at)) / (area_row.decay_days * 86400.0) * 100
    ));

    foreach threshold in array array[30, 25] loop
      if percent_now <= threshold then
        insert into public.email_outbox (event_key, template, recipient, locale, payload)
        values (
          -- last_cleaned_at in the key re-arms every reminder after each service.
          'area-threshold:' || area_row.id::text || ':' || threshold::text
            || ':' || extract(epoch from area_row.last_cleaned_at)::bigint::text,
          'area-reminder',
          area_row.recipient,
          area_row.locale,
          jsonb_build_object(
            'area', area_row.label,
            'areaType', case when area_row.locale = 'en' then area_row.type_en else area_row.type_es end,
            'percent', round(percent_now)::integer,
            'threshold', threshold,
            'daysSince', floor(extract(epoch from (now() - area_row.last_cleaned_at)) / 86400)::integer,
            'serviceCode', area_row.service_code,
            'consumables', to_jsonb(area_row.consumable_categories)
          )
        ) on conflict (event_key) do nothing;
        if found then queued := queued + 1; end if;
      end if;
    end loop;
  end loop;

  return queued;
end;
$$;

revoke all on function public.sweep_area_reminders() from public, anon, authenticated;
grant execute on function public.sweep_area_reminders() to service_role;

commit;
