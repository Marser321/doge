-- Customer change requests, area links and guide preferences: ownership,
-- the 24-hour rule, one pending change, staff-only resolution, and the
-- cleanliness reset once linked areas are serviced.
begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

-- ── Fixtures ──────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  ('13000000-0000-0000-0000-000000000001', 'ana-change@test.doge'),
  ('13000000-0000-0000-0000-000000000002', 'beto-change@test.doge'),
  ('13000000-0000-0000-0000-000000000003', 'dispatch-change@test.doge');
update public.profiles set is_active = false
where id in ('13000000-0000-0000-0000-000000000001', '13000000-0000-0000-0000-000000000002');
update public.profiles set role = 'dispatcher', is_active = true
where id = '13000000-0000-0000-0000-000000000003';

insert into public.clients (id, name, email, auth_user_id) values
  ('23000000-0000-0000-0000-000000000001', 'Ana', 'ana-change@test.doge', '13000000-0000-0000-0000-000000000001'),
  ('23000000-0000-0000-0000-000000000002', 'Beto', 'beto-change@test.doge', '13000000-0000-0000-0000-000000000002');

insert into public.properties (id, client_id, address, city, property_type) values
  ('33000000-0000-0000-0000-000000000001', '23000000-0000-0000-0000-000000000001', '1 Ana St', 'Miami', 'Residencial'),
  ('33000000-0000-0000-0000-000000000002', '23000000-0000-0000-0000-000000000002', '2 Beto St', 'Miami', 'Residencial');

insert into public.property_areas (id, property_id, area_type_code, label) values
  ('43000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000001', 'kitchen', 'Cocina Ana'),
  ('43000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000002', 'kitchen', 'Cocina Beto');

insert into public.service_catalog (id, code, name_es, name_en)
values ('53000000-0000-0000-0000-000000000001', 'change-test', 'Prueba', 'Test');
insert into public.teams (id, name, capacity_size)
values ('63000000-0000-0000-0000-000000000001', 'Equipo cambios', 2);

insert into public.service_requests (
  id, reference_code, client_id, property_id, service_id, service_name_snapshot, contact_name, contact_email, status
) values
  ('73000000-0000-0000-0000-000000000001', 'CHG-1', '23000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000001',
   '53000000-0000-0000-0000-000000000001', 'Prueba', 'Ana', 'ana-change@test.doge', 'scheduled'),
  ('73000000-0000-0000-0000-000000000002', 'CHG-2', '23000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000001',
   '53000000-0000-0000-0000-000000000001', 'Prueba', 'Ana', 'ana-change@test.doge', 'scheduled'),
  ('73000000-0000-0000-0000-000000000003', 'CHG-3', '23000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000002',
   '53000000-0000-0000-0000-000000000001', 'Prueba', 'Beto', 'beto-change@test.doge', 'approved');

insert into public.appointments (service_request_id, property_id, team_id, starts_at, ends_at) values
  -- Comfortably more than 24 hours away.
  ('73000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000001', '63000000-0000-0000-0000-000000000001',
   now() + interval '3 days', now() + interval '3 days 2 hours'),
  -- Two hours away: too late for a change.
  ('73000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000001', '63000000-0000-0000-0000-000000000001',
   now() + interval '2 hours', now() + interval '4 hours');

-- ── As Ana (customer) ─────────────────────────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"13000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}';

select is(
  (public.request_appointment_change(
    '73000000-0000-0000-0000-000000000001', 'schedule',
    ((now() at time zone 'America/New_York')::date + 5), 'morning', null
  )).kind::text,
  'reschedule',
  'a request with a live appointment becomes a reschedule'
);
select throws_like(
  $$ select public.request_appointment_change('73000000-0000-0000-0000-000000000001', 'reschedule',
       ((now() at time zone 'America/New_York')::date + 6), 'afternoon', null) $$,
  '%cambio pendiente%',
  'only one pending change per cleaning'
);
select throws_like(
  $$ select public.request_appointment_change('73000000-0000-0000-0000-000000000002', 'reschedule',
       ((now() at time zone 'America/New_York')::date + 6), 'afternoon', null) $$,
  '%24 horas%',
  'changes need 24 hours of notice'
);
select throws_like(
  $$ select public.request_appointment_change('73000000-0000-0000-0000-000000000001', 'cancel', null, null, '  ') $$,
  '%requiere un motivo%',
  'a cancellation needs a reason'
);
select throws_like(
  $$ select public.request_appointment_change('73000000-0000-0000-0000-000000000003', 'schedule',
       ((now() at time zone 'America/New_York')::date + 5), 'morning', null) $$,
  'Solicitud no encontrada',
  'a customer cannot ask for changes on someone else''s cleaning'
);
select is(
  (select count(*) from public.appointment_change_requests),
  1::bigint,
  'a customer sees only their own change requests'
);
select throws_like(
  $$ insert into public.appointment_change_requests (client_id, service_request_id, kind, preferred_date)
     values ('23000000-0000-0000-0000-000000000001', '73000000-0000-0000-0000-000000000001', 'schedule', current_date + 3) $$,
  '%permission denied%',
  'change requests are written only through the RPC'
);
select throws_like(
  $$ select public.resolve_appointment_change(
       (select id from public.appointment_change_requests limit 1), 'approved', null, null, null, null) $$,
  'Rol no autorizado',
  'customers cannot resolve their own changes'
);

select is(
  public.link_request_areas('73000000-0000-0000-0000-000000000001', array['43000000-0000-0000-0000-000000000001']::uuid[]),
  1,
  'a customer links their own space to their own cleaning'
);
select throws_like(
  $$ select public.link_request_areas('73000000-0000-0000-0000-000000000001', array['43000000-0000-0000-0000-000000000002']::uuid[]) $$,
  '%no pertenecen%',
  'a space from another property cannot be linked'
);

insert into public.client_preferences (client_id, guide_progress)
values ('23000000-0000-0000-0000-000000000001', '{"space":"2026-10-01T00:00:00Z"}');
select is(
  (select guide_enabled from public.client_preferences where client_id = '23000000-0000-0000-0000-000000000001'),
  true,
  'a customer stores their own guide preferences'
);
select throws_like(
  $$ insert into public.client_preferences (client_id) values ('23000000-0000-0000-0000-000000000002') $$,
  '%row-level security%',
  'but not someone else''s'
);

-- ── As Beto (another customer) ────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"13000000-0000-0000-0000-000000000002","role":"authenticated","aal":"aal1"}';
select is(
  (select count(*) from public.appointment_change_requests),
  0::bigint,
  'another customer sees none of Ana''s changes'
);

-- ── As dispatch ───────────────────────────────────────────────────────
set local "request.jwt.claims" = '{"sub":"13000000-0000-0000-0000-000000000003","role":"authenticated","aal":"aal1"}';
select throws_like(
  $$ select public.resolve_appointment_change(
       (select id from public.appointment_change_requests where status = 'pending' and client_id = '23000000-0000-0000-0000-000000000001'), 'declined', '', null, null, null) $$,
  '%requiere un motivo%',
  'declining requires a note for the customer'
);
select is(
  (public.resolve_appointment_change(
    (select id from public.appointment_change_requests where status = 'pending' and client_id = '23000000-0000-0000-0000-000000000001'), 'approved', 'Te esperamos', null, null, null
  )).status::text,
  'approved',
  'dispatch approves the change'
);

-- Completing the cleaning resets the linked space.
select public.transition_service_request('73000000-0000-0000-0000-000000000001', 'in_progress', null);
select public.transition_service_request('73000000-0000-0000-0000-000000000001', 'completed', null);
reset role;
select is(
  (select count(*) from public.email_outbox
   where template in ('appointment-change-received', 'appointment-change-resolved') and recipient = 'ana-change@test.doge'),
  2::bigint,
  'the customer is emailed on request and on resolution'
);
select isnt(
  (select last_cleaned_at from public.property_areas where id = '43000000-0000-0000-0000-000000000001'),
  null,
  'completing a cleaning resets the linked space to 100%'
);

select * from finish();
rollback;
