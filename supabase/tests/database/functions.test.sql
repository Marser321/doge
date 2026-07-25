begin;
create extension if not exists pgtap with schema extensions;

select plan(13);

select has_function('public', 'consume_rate_limit', array['text','text','integer','integer']);
select has_function('public', 'create_public_service_request', array['jsonb','text[]']);
select has_function('public', 'transition_service_request', array['uuid','request_status','text']);
select has_function('public', 'schedule_appointment', array['uuid','uuid','timestamp with time zone','timestamp with time zone','text']);
select has_function('public', 'create_order_with_items', array['jsonb','jsonb']);
select has_function('public', 'transition_order', array['uuid','order_status']);
select has_function('public', 'generate_subscription_requests', array['integer']);
select has_function('public', 'create_product_with_inventory', array['jsonb','integer']);
select has_function('public', 'create_quote_with_items', array['uuid','jsonb','bigint','integer','text','text','text']);
select has_function('public', 'update_staff_profile', array['uuid','staff_role','boolean','text']);
select has_function('public', 'reschedule_appointment', array['uuid','uuid','timestamp with time zone','timestamp with time zone','text']);
select has_function('public', 'create_subscription_with_item', array['uuid','uuid','uuid','uuid','subscription_status','bigint','date','date','smallint']);
select has_function('public', 'update_commerce_intent', array['uuid','intent_status','text','bigint','boolean']);

select * from finish();
rollback;
