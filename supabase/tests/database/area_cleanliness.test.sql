-- Behaviour of the cleanliness cycle: decay, threshold reminders, their
-- deduplication, and the columns a customer must not be able to write.
begin;
create extension if not exists pgtap with schema extensions;

select plan(10);

insert into auth.users (id, email)
values ('12000000-0000-0000-0000-000000000001', 'cycle@test.doge');
update public.profiles set is_active = false where id = '12000000-0000-0000-0000-000000000001';

insert into public.clients (id, name, email, auth_user_id, segment, lifetime_value_cents)
values ('22000000-0000-0000-0000-000000000001', 'Cycle', 'cycle@test.doge',
        '12000000-0000-0000-0000-000000000001', 'standard', 0);

insert into public.properties (id, client_id, address, city, property_type)
values ('32000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001',
        '1 Cycle Way', 'Miami', 'Residencial');

-- kitchen has a 21-day cycle, so 18 days elapsed leaves ~14% (below both thresholds).
insert into public.property_areas (id, property_id, area_type_code, label, last_cleaned_at)
values ('42000000-0000-0000-0000-000000000001', '32000000-0000-0000-0000-000000000001',
        'kitchen', 'Cocina', now() - interval '18 days'),
       -- A freshly cleaned area must stay silent.
       ('42000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000001',
        'bedroom', 'Dormitorio', now() - interval '1 day');

-- ── The sweep queues both thresholds for the stale area only ──────────
select is(public.sweep_area_reminders(), 2, 'sweep queues one email per crossed threshold');
select is(
  (select count(*) from public.email_outbox where template = 'area-reminder'),
  2::bigint,
  'both reminders landed in the outbox'
);
select is(
  (select count(*) from public.email_outbox
   where template = 'area-reminder' and payload ->> 'area' = 'Dormitorio'),
  0::bigint,
  'a recently cleaned area raises nothing'
);

-- ── Running it again must not re-send ─────────────────────────────────
select is(public.sweep_area_reminders(), 0, 'a second sweep queues nothing');
select is(
  (select count(*) from public.email_outbox where template = 'area-reminder'),
  2::bigint,
  'and the outbox did not grow'
);

-- ── Completing a service rearms the cycle ─────────────────────────────
update public.property_areas set last_cleaned_at = now()
where id = '42000000-0000-0000-0000-000000000001';
select is(public.sweep_area_reminders(), 0, 'a cleaned area is silent again');

update public.property_areas set last_cleaned_at = now() - interval '20 days'
where id = '42000000-0000-0000-0000-000000000001';
select is(
  public.sweep_area_reminders(), 2,
  'after a new cycle the thresholds fire again rather than staying deduplicated forever'
);

-- ── A customer cannot promote themselves ──────────────────────────────
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"12000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}';

update public.clients set name = 'Cycle renamed' where id = '22000000-0000-0000-0000-000000000001';
select is(
  (select name from public.clients where id = '22000000-0000-0000-0000-000000000001'),
  'Cycle renamed',
  'a customer can edit the columns they own'
);

update public.clients set segment = 'vip', lifetime_value_cents = 999999
where id = '22000000-0000-0000-0000-000000000001';
select is(
  (select segment from public.clients where id = '22000000-0000-0000-0000-000000000001'),
  'standard',
  'but segment is pinned by the guard trigger'
);
select is(
  (select lifetime_value_cents from public.clients where id = '22000000-0000-0000-0000-000000000001'),
  0::bigint,
  'and so is lifetime value'
);

select * from finish();
rollback;
