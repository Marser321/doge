begin;
create extension if not exists pgtap with schema extensions;

select plan(10);

insert into auth.users (id, email)
values ('71000000-0000-0000-0000-000000000001', 'transaction-owner@test.doge');
update public.profiles
set role = 'owner', is_active = true
where id = '71000000-0000-0000-0000-000000000001';

insert into public.clients (id, name, email)
values ('72000000-0000-0000-0000-000000000001', 'Cliente transaccional', 'transaction-client@test.doge');
insert into public.properties (id, client_id, address, city, property_type)
values (
  '73000000-0000-0000-0000-000000000001',
  '72000000-0000-0000-0000-000000000001',
  '10 Transaction Way',
  'Miami',
  'Residencial'
);
insert into public.service_requests (
  id, reference_code, client_id, property_id, service_name_snapshot,
  contact_name, contact_email, source, status
) values (
  '74000000-0000-0000-0000-000000000001',
  'DOGE-TEST-TRANSACTION',
  '72000000-0000-0000-0000-000000000001',
  '73000000-0000-0000-0000-000000000001',
  'Servicio transaccional',
  'Cliente transaccional',
  'transaction-client@test.doge',
  'admin',
  'new'
);
insert into public.products (
  id, name, slug, price_cents, sale_type, is_active
) values (
  '75000000-0000-0000-0000-000000000001',
  'Producto transaccional',
  'producto-transaccional',
  2500,
  'own_stock',
  true
);
insert into public.inventory_levels (product_id, on_hand)
values ('75000000-0000-0000-0000-000000000001', 2);

set local role authenticated;
set local "request.jwt.claims" = '{"sub":"71000000-0000-0000-0000-000000000001","role":"authenticated","aal":"aal2"}';

select throws_ok(
  $$ select public.transition_service_request(
    '74000000-0000-0000-0000-000000000001'::uuid,
    'completed'::public.request_status,
    null
  ) $$,
  'P0001',
  'Transición de solicitud no válida',
  'the request state machine rejects an invalid jump'
);
select is(
  (select status::text from public.service_requests where id = '74000000-0000-0000-0000-000000000001'),
  'new',
  'an invalid transition leaves the request unchanged'
);

select throws_ok(
  $$ select public.create_order_with_items(
    '{"customer_name":"Cliente transaccional","status":"confirmed"}'::jsonb,
    '[{"product_id":"75000000-0000-0000-0000-000000000001","quantity":3}]'::jsonb
  ) $$,
  'P0001',
  'Stock insuficiente para Producto transaccional',
  'a confirmed order cannot oversell inventory'
);
select is(
  (select count(*) from public.orders where customer_name = 'Cliente transaccional'),
  0::bigint,
  'the failed order is rolled back'
);
select is(
  (select on_hand from public.inventory_levels where product_id = '75000000-0000-0000-0000-000000000001'),
  2,
  'the failed order does not consume stock'
);

select lives_ok(
  $$ select public.create_order_with_items(
    '{"customer_name":"Cliente transaccional","status":"confirmed"}'::jsonb,
    '[{"product_id":"75000000-0000-0000-0000-000000000001","quantity":1}]'::jsonb
  ) $$,
  'a valid confirmed order is created atomically'
);
select is(
  (select count(*) from public.orders where customer_name = 'Cliente transaccional'),
  1::bigint,
  'the valid order is persisted once'
);
select is(
  (select on_hand from public.inventory_levels where product_id = '75000000-0000-0000-0000-000000000001'),
  1,
  'confirmation consumes inventory'
);

select lives_ok(
  $$ select public.transition_order(
    (select id from public.orders where customer_name = 'Cliente transaccional' limit 1),
    'cancelled'::public.order_status
  ) $$,
  'a confirmed order can be cancelled'
);
select is(
  (select on_hand from public.inventory_levels where product_id = '75000000-0000-0000-0000-000000000001'),
  2,
  'cancellation restores inventory with a compensating transaction'
);

select * from finish();
rollback;
