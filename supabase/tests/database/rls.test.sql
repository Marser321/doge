begin;
create extension if not exists pgtap with schema extensions;

select plan(21);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.clients'::regclass),
  'clients has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.orders'::regclass),
  'orders has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.inventory_levels'::regclass),
  'inventory has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.audit_events'::regclass),
  'audit has RLS enabled'
);

select is(
  has_table_privilege('anon', 'public.clients', 'SELECT'),
  false,
  'anon cannot select clients'
);
select is(
  has_table_privilege('anon', 'public.orders', 'SELECT'),
  false,
  'anon cannot select orders'
);
select is(
  has_table_privilege('authenticated', 'public.inventory_movements', 'INSERT'),
  false,
  'inventory ledger cannot be inserted directly'
);
select is(
  has_table_privilege('authenticated', 'public.audit_events', 'INSERT'),
  false,
  'audit events cannot be inserted directly'
);
select is(
  has_table_privilege('authenticated', 'public.api_idempotency_keys', 'SELECT'),
  false,
  'idempotency records stay server-only'
);
select is(
  has_table_privilege('authenticated', 'public.commerce_intents', 'UPDATE'),
  false,
  'commerce intent updates must use the role-aware RPC'
);
select is(
  has_table_privilege('authenticated', 'public.orders', 'INSERT'),
  false,
  'orders can only be created by the transactional RPC'
);
select is(
  has_table_privilege('authenticated', 'public.service_requests', 'UPDATE'),
  false,
  'request state changes can only use the state-machine RPC'
);

select is(
  has_function_privilege('anon', 'public.create_public_service_request(jsonb,text[])', 'EXECUTE'),
  false,
  'anon cannot invoke public intake RPC directly'
);
select is(
  has_function_privilege('anon', 'public.decide_quote(text,text)', 'EXECUTE'),
  false,
  'anon cannot invoke quote decisions directly'
);
select is(
  has_function_privilege('service_role', 'public.consume_rate_limit(text,text,integer,integer)', 'EXECUTE'),
  true,
  'BFF service role can use distributed rate limiting'
);
select is(
  has_function_privilege('service_role', 'public.create_public_service_request(jsonb,text[])', 'EXECUTE'),
  true,
  'BFF service role can create a validated public request'
);
select is(
  has_function_privilege('service_role', 'public.generate_subscription_requests(integer)', 'EXECUTE'),
  true,
  'internal scheduler can generate recurring requests'
);
select is(
  has_function_privilege('service_role', 'public.claim_email_outbox(integer)', 'EXECUTE'),
  true,
  'internal mail dispatcher can claim outbox work'
);
select is(
  has_function_privilege('authenticated', 'public.create_order_with_items(jsonb,jsonb)', 'EXECUTE'),
  true,
  'authenticated staff can invoke the order transaction'
);
select is(
  (select public from storage.buckets where id = 'booking-attachments'),
  false,
  'booking attachments bucket is private'
);
select is(
  (select public from storage.buckets where id = 'product-media'),
  true,
  'product media bucket is public'
);

select * from finish();
rollback;
