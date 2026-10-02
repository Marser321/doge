begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

insert into auth.users (id, email)
values
  ('10000000-0000-0000-0000-000000000001', 'owner@test.doge'),
  ('10000000-0000-0000-0000-000000000002', 'dispatcher@test.doge'),
  ('10000000-0000-0000-0000-000000000003', 'crew@test.doge');

update public.profiles
set role = case
    when id = '10000000-0000-0000-0000-000000000001' then 'owner'::public.staff_role
    when id = '10000000-0000-0000-0000-000000000002' then 'dispatcher'::public.staff_role
    else 'crew'::public.staff_role
  end,
  is_active = true;

insert into public.clients (id, name, email)
values
  ('20000000-0000-0000-0000-000000000001', 'Cliente asignado', 'assigned@test.doge'),
  ('20000000-0000-0000-0000-000000000002', 'Cliente privado', 'private@test.doge');
insert into public.properties (id, client_id, address, city, property_type)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '1 Ocean Drive', 'Miami', 'Residencial'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '2 Ocean Drive', 'Miami', 'Residencial');
insert into public.service_requests (
  id, reference_code, client_id, property_id, service_name_snapshot,
  contact_name, contact_email, source, status
) values
  (
    '40000000-0000-0000-0000-000000000001', 'DOGE-TEST-ASSIGNED',
    '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
    'Servicio asignado', 'Cliente asignado', 'assigned@test.doge', 'admin', 'scheduled'
  ),
  (
    '40000000-0000-0000-0000-000000000002', 'DOGE-TEST-PRIVATE',
    '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002',
    'Servicio privado', 'Cliente privado', 'private@test.doge', 'admin', 'new'
  );
insert into public.teams (id, name, capacity_size)
values ('50000000-0000-0000-0000-000000000001', 'Equipo test', 1);
insert into public.team_members (team_id, profile_id, starts_on)
values (
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000003',
  current_date - 1
);
insert into public.appointments (
  id, service_request_id, property_id, team_id, starts_at, ends_at
) values (
  '60000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  now() + interval '1 day',
  now() + interval '1 day 2 hours'
);

-- Counts are filtered to the rows this file creates. Plain totals depended on
-- whatever else lived in the database, so the suite only passed against a
-- freshly reset one. The filter is inline on purpose: a view would run with its
-- owner's privileges and bypass the very RLS this file exists to verify.
set local role authenticated;

-- MFA is no longer an RLS concern. 202607260003_opt_in_mfa_roles removed the
-- aal2 requirement from private.current_role() deliberately, moving that
-- enforcement to the application via ENFORCE_MFA (src/lib/server/auth.ts).
-- These two assertions pin that decision: the assurance level must not change
-- what the database hands back.
set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}';
select is(
  (select count(*) from public.clients where id in (
    '20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')),
  2::bigint,
  'owner reads CRM data at aal1: MFA is enforced by the app, not by RLS'
);

set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal2"}';
select is(
  (select count(*) from public.clients where id in (
    '20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')),
  2::bigint,
  'owner reads the same CRM data at aal2'
);

set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}';
select is(
  (select count(*) from public.clients where id in (
    '20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')),
  2::bigint,
  'dispatcher can read CRM clients'
);

set local "request.jwt.claims" = '{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}';
select is(
  (select count(*) from public.service_requests where id in (
    '40000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000002')),
  1::bigint,
  'crew sees only assigned requests'
);
select is(
  (select count(*) from public.clients where id in (
    '20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002')),
  1::bigint,
  'crew sees only the assigned client'
);
select is((select count(*) from public.quotes), 0::bigint, 'crew cannot read quotes');

select * from finish();
rollback;
