-- Quotes could not be created or decided.
--
-- `create_quote_with_items` and `decide_quote` assign CASE expressions of
-- string literals to enum columns. A CASE of literals resolves to `text`, and
-- there is no assignment cast from text to an enum, so every call failed with
-- `column "status" is of type public.quote_status but expression is of type
-- text`. Bodies are the foundation's verbatim; only the explicit casts are new.

begin;

create or replace function public.create_quote_with_items(
  p_request_id uuid,
  p_items jsonb,
  p_discount_cents bigint default 0,
  p_tax_basis_points integer default 0,
  p_notes text default null,
  p_access_token_hash text default null,
  p_approval_url text default null
)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_request public.service_requests;
  created_quote public.quotes;
  item jsonb;
  item_total bigint;
  subtotal bigint := 0;
  tax_value bigint := 0;
  total_value bigint := 0;
  generated_number text;
begin
  if not private.has_any_role(array['owner','manager','dispatcher']::public.staff_role[]) then
    raise exception 'Rol no autorizado';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'La cotización requiere conceptos';
  end if;
  if p_discount_cents < 0 or p_tax_basis_points not between 0 and 10000 then
    raise exception 'Importes inválidos';
  end if;
  select * into target_request from public.service_requests where id = p_request_id for update;
  if not found or target_request.status not in ('reviewing', 'quoted') then
    raise exception 'La solicitud no admite cotización';
  end if;

  for item in select value from jsonb_array_elements(p_items) loop
    item_total := round(
      coalesce((item ->> 'quantity')::numeric, 1) *
      coalesce((item ->> 'unit_price_cents')::bigint, 0)
    );
    if item_total < 0 then raise exception 'Importe de concepto inválido'; end if;
    subtotal := subtotal + item_total;
  end loop;
  if p_discount_cents > subtotal then raise exception 'Descuento inválido'; end if;
  tax_value := round((subtotal - p_discount_cents) * p_tax_basis_points / 10000.0);
  total_value := subtotal - p_discount_cents + tax_value;
  generated_number := 'Q-' || to_char(now() at time zone 'America/New_York', 'YYYYMMDD')
    || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.quotes (
    quote_number, service_request_id, status, subtotal_cents, discount_cents,
    tax_cents, total_cents, tax_basis_points, notes, access_token_hash,
    expires_at, sent_at, created_by
  ) values (
    generated_number, p_request_id,
    (case when p_access_token_hash is null then 'draft' else 'sent' end)::public.quote_status,
    subtotal, p_discount_cents, tax_value, total_value, p_tax_basis_points,
    nullif(btrim(p_notes), ''), p_access_token_hash,
    case when p_access_token_hash is null then null else now() + interval '14 days' end,
    case when p_access_token_hash is null then null else now() end,
    (select auth.uid())
  ) returning * into created_quote;

  for item in select value from jsonb_array_elements(p_items) loop
    item_total := round(
      coalesce((item ->> 'quantity')::numeric, 1) *
      coalesce((item ->> 'unit_price_cents')::bigint, 0)
    );
    insert into public.quote_items (
      quote_id, service_id, description, quantity, unit_price_cents, total_cents, sort_order
    ) values (
      created_quote.id, nullif(item ->> 'service_id', '')::uuid,
      btrim(item ->> 'description'), coalesce((item ->> 'quantity')::numeric, 1),
      coalesce((item ->> 'unit_price_cents')::bigint, 0), item_total,
      coalesce((item ->> 'sort_order')::integer, 0)
    );
  end loop;

  update public.service_requests
  set status = (case when p_access_token_hash is null then 'reviewing' else 'quoted' end)::public.request_status
  where id = p_request_id;
  insert into public.request_activity (
    service_request_id, actor_id, action, from_status, to_status, metadata
  ) values (
    p_request_id, (select auth.uid()), 'quote.created', target_request.status,
    (case when p_access_token_hash is null then 'reviewing' else 'quoted' end)::public.request_status,
    jsonb_build_object('quote_id', created_quote.id, 'total_cents', total_value)
  );
  if p_access_token_hash is not null and p_approval_url is not null and target_request.contact_email is not null then
    insert into public.email_outbox (event_key, template, recipient, locale, payload)
    values (
      'quote-ready:' || created_quote.id::text,
      'quote-ready',
      target_request.contact_email,
      target_request.locale,
      jsonb_build_object(
        'name', target_request.contact_name,
        'reference', target_request.reference_code,
        'service', target_request.service_name_snapshot,
        'approvalUrl', p_approval_url
      )
    ) on conflict (event_key) do nothing;
  end if;
  perform private.write_audit('quote.created', 'quotes', created_quote.id::text, jsonb_build_object('total_cents', total_value));
  return created_quote;
end;
$$;

create or replace function public.decide_quote(
  p_access_token_hash text,
  p_decision text
)
returns public.quotes
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_quote public.quotes;
  target_request public.service_requests;
begin
  if p_decision not in ('accepted', 'declined') then raise exception 'Decisión inválida'; end if;
  select * into target_quote
  from public.quotes
  where access_token_hash = p_access_token_hash
  for update;
  if not found or target_quote.status <> 'sent' or target_quote.expires_at <= now() then
    raise exception 'La cotización no está disponible';
  end if;
  update public.quotes
  set status = p_decision::public.quote_status, decided_at = now(), access_token_hash = null
  where id = target_quote.id returning * into target_quote;
  update public.service_requests
  set status = (case when p_decision = 'accepted' then 'approved' else 'cancelled' end)::public.request_status,
      cancellation_reason = case when p_decision = 'declined' then 'Cotización rechazada por el cliente' else cancellation_reason end
  where id = target_quote.service_request_id
  returning * into target_request;
  insert into public.request_activity (
    service_request_id, action, from_status, to_status, metadata
  ) values (
    target_request.id, 'quote.' || p_decision, 'quoted', target_request.status,
    jsonb_build_object('quote_id', target_quote.id)
  );
  insert into public.email_outbox (event_key, template, recipient, locale, payload)
  values (
    'quote-decision:' || target_quote.id::text,
    'quote-decision',
    target_request.contact_email,
    target_request.locale,
    jsonb_build_object(
      'name', target_request.contact_name,
      'reference', target_request.reference_code,
      'decision', p_decision,
      'quoteNumber', target_quote.quote_number
    )
  ) on conflict (event_key) do nothing;
  return target_quote;
end;
$$;

commit;
