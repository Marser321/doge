-- A signed-in customer must see their own records and nothing else.
-- `profiles` stays staff-only, so these users deliberately have no row there.
begin;
create extension if not exists pgtap with schema extensions;

select plan(12);

insert into auth.users (id, email)
values
  ('11000000-0000-0000-0000-000000000001', 'ada@test.doge'),
  ('11000000-0000-0000-0000-000000000002', 'bob@test.doge'),
  ('11000000-0000-0000-0000-000000000003', 'nolink@test.doge');

-- handle_new_user creates staff profiles; customers must stay inactive there.
update public.profiles set is_active = false
where id in (
  '11000000-0000-0000-0000-000000000001',
  '11000000-0000-0000-0000-000000000002',
  '11000000-0000-0000-0000-000000000003'
);

insert into public.clients (id, name, email, auth_user_id)
values
  ('21000000-0000-0000-0000-000000000001', 'Ada', 'ada@test.doge', '11000000-0000-0000-0000-000000000001'),
  ('21000000-0000-0000-0000-000000000002', 'Bob', 'bob@test.doge', '11000000-0000-0000-0000-000000000002');

insert into public.properties (id, client_id, address, city, property_type)
values
  ('31000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', '1 Ada Way', 'Miami', 'Residencial'),
  ('31000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000002', '2 Bob Way', 'Miami', 'Residencial');

insert into public.property_areas (id, property_id, area_type_code, label, last_cleaned_at)
values
  ('41000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 'kitchen', 'Cocina Ada', now()),
  ('41000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002', 'kitchen', 'Cocina Bob', now());

insert into public.service_requests (
  id, reference_code, client_id, property_id, service_name_snapshot,
  contact_name, contact_email, source, status
) values
  (
    '51000000-0000-0000-0000-000000000001', 'DOGE-TEST-ADA',
    '21000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001',
    'Servicio Ada', 'Ada', 'ada@test.doge', 'website', 'new'
  ),
  (
    '51000000-0000-0000-0000-000000000002', 'DOGE-TEST-BOB',
    '21000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002',
    'Servicio Bob', 'Bob', 'bob@test.doge', 'website', 'new'
  );

select ok(
  (select relrowsecurity from pg_class where oid = 'public.property_areas'::regclass),
  'property_areas has RLS enabled'
);
select is(
  has_table_privilege('anon', 'public.property_areas', 'SELECT'),
  false,
  'anon cannot select property_areas'
);

set local role authenticated;

-- ── Ada sees only her own records ─────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"11000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}';
select is((select count(*) from public.clients), 1::bigint, 'customer sees only their own client row');
select is((select name from public.clients), 'Ada', 'and it is the right one');
select is((select count(*) from public.properties), 1::bigint, 'customer sees only their own properties');
select is((select count(*) from public.property_areas), 1::bigint, 'customer sees only their own areas');
select is((select label from public.property_areas), 'Cocina Ada', 'and it is the right area');
select is((select count(*) from public.service_requests), 1::bigint, 'customer sees only their own requests');

-- ── Bob is fully isolated from Ada ────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"11000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}';
select is((select count(*) from public.property_areas), 1::bigint, 'the other customer sees only their own area');
select is((select label from public.property_areas), 'Cocina Bob', 'with no leakage across accounts');

-- ── A session with no client record sees nothing ──────────────────────
set local "request.jwt.claims" = '{"sub":"11000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}';
select is((select count(*) from public.clients), 0::bigint, 'an unlinked session sees no clients');
select is((select count(*) from public.property_areas), 0::bigint, 'an unlinked session sees no areas');

-- The area catalogue is shared reference data, readable by any signed-in user.
select ok((select count(*) from public.area_types) > 0, 'area catalogue is readable by any signed-in user');

select * from finish();
rollback;
