-- A signed-in customer can request a membership for one of their properties.
--
-- Until now /membership reused /api/bookings and wrote the chosen plan as prose
-- into `service_requests.notes`: no `subscriptions` row was ever created and a
-- human had to read the note. This creates a real pending subscription that
-- staff only has to confirm.

begin;

create or replace function public.request_membership(
  p_plan_id uuid,
  p_property_id uuid,
  p_service_code text default null,
  p_notes text default null
)
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_client uuid;
  selected_plan public.subscription_plans;
  selected_service public.service_catalog;
  created_subscription public.subscriptions;
begin
  caller_client := private.current_client_id();
  if caller_client is null then
    raise exception 'No autorizado: la cuenta no tiene una ficha de cliente.';
  end if;

  -- The property must belong to the caller; never trust the id from the client.
  if not exists (
    select 1 from public.properties
    where id = p_property_id and client_id = caller_client and archived_at is null
  ) then
    raise exception 'La propiedad no pertenece a tu cuenta.';
  end if;

  select * into selected_plan from public.subscription_plans
  where id = p_plan_id and is_active = true;
  if not found then raise exception 'El plan no está disponible.'; end if;

  -- One pending or active membership per client keeps the panel unambiguous.
  if exists (
    select 1 from public.subscriptions
    where client_id = caller_client
      and status in ('pending', 'active')
      and archived_at is null
  ) then
    raise exception 'Ya tienes una membresía en curso.';
  end if;

  select * into selected_service from public.service_catalog
  where code = coalesce(nullif(btrim(p_service_code), ''), 'window-cleaning')
    and is_active = true;
  if not found then raise exception 'Servicio no disponible'; end if;

  insert into public.subscriptions (
    client_id, property_id, plan_id, status, cadence_days,
    monthly_value_cents, notes
  ) values (
    caller_client, p_property_id, selected_plan.id, 'pending', selected_plan.cadence_days,
    selected_plan.base_price_cents, nullif(btrim(p_notes), '')
  )
  returning * into created_subscription;

  insert into public.subscription_items (
    subscription_id, service_id, quantity, unit_price_cents, estimated_duration_minutes
  ) values (
    created_subscription.id, selected_service.id, 1,
    selected_service.base_price_cents, selected_service.default_duration_minutes
  );

  perform private.write_audit(
    'subscription.requested', 'subscriptions', created_subscription.id::text,
    jsonb_build_object('plan', selected_plan.name, 'source', 'customer')
  );

  return created_subscription;
end;
$$;

revoke all on function public.request_membership(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.request_membership(uuid, uuid, text, text) to authenticated;

commit;
