-- Quotes are actually created and decided, not only declared: both RPCs
-- write enum columns and must type their status values correctly.
begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

insert into auth.users (id, email)
values ('14000000-0000-0000-0000-000000000001', 'quote-dispatch@test.doge');
update public.profiles set role = 'dispatcher', is_active = true
where id = '14000000-0000-0000-0000-000000000001';

insert into public.clients (id, name, email)
values ('24000000-0000-0000-0000-000000000001', 'Quote Client', 'quote-client@test.doge');
insert into public.properties (id, client_id, address, city, property_type)
values ('34000000-0000-0000-0000-000000000001', '24000000-0000-0000-0000-000000000001', '1 Quote St', 'Miami', 'Residencial');
insert into public.service_requests (
  id, reference_code, client_id, property_id, service_name_snapshot, contact_name, contact_email, status
) values (
  '74000000-0000-0000-0000-000000000001', 'QTE-1', '24000000-0000-0000-0000-000000000001',
  '34000000-0000-0000-0000-000000000001', 'Prueba', 'Quote Client', 'quote-client@test.doge', 'reviewing'
);

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"14000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal1"}';

select is(
  (public.create_quote_with_items(
    '74000000-0000-0000-0000-000000000001',
    '[{"description":"Servicio","quantity":2,"unit_price_cents":10000}]'::jsonb,
    1000, 700, null, 'quote-token-hash', 'https://example.test/quote/x'
  )).status::text,
  'sent',
  'a quote with an access token is created as sent'
);
select is(
  (select status::text from public.service_requests where id = '74000000-0000-0000-0000-000000000001'),
  'quoted',
  'and its request moves to quoted'
);
select is(
  (select total_cents from public.quotes where service_request_id = '74000000-0000-0000-0000-000000000001'),
  20330::bigint,
  'totals: 20000 - 1000 discount + 7% tax'
);

-- The public quote page calls this server-side with the service role.
reset role;
select is(
  (public.decide_quote('quote-token-hash', 'accepted')).status::text,
  'accepted',
  'the customer accepts through the token'
);
select is(
  (select status::text from public.service_requests where id = '74000000-0000-0000-0000-000000000001'),
  'approved',
  'an accepted quote approves the request'
);
select is(
  (select to_status::text from public.request_activity
   where service_request_id = '74000000-0000-0000-0000-000000000001' and action = 'quote.accepted'),
  'approved',
  'and the decision is recorded in the activity'
);

select * from finish();
rollback;
