-- Launch catalogue realignment.
--
-- 1. The public service catalogue narrows to three services: window cleaning,
--    pressure washing and carpet cleaning.
-- 2. The retired services are deactivated, never deleted: service_requests and
--    subscription_items hold foreign keys to them and service_requests keeps a
--    service_name_snapshot for audited history.
-- 3. products.category becomes a slug from the application store taxonomy
--    (src/content/store-taxonomy.ts) instead of free-text prose.

begin;

-- ── Service catalogue ────────────────────────────────────────────────
insert into public.service_catalog (
  code, name_es, name_en, description_es, description_en,
  default_duration_minutes, base_price_cents, is_active, sort_order
) values
  (
    'window-cleaning', 'Limpieza de Cristales', 'Window Cleaning',
    'Cristales exteriores e interiores con tecnología WFP de agua pura.',
    'Interior and exterior glass with WFP pure-water technology.',
    180, 32000, true, 10
  ),
  (
    'pressure-washing', 'Lavado a Presión', 'Pressure Washing',
    'Recuperación de entradas, terrazas, pavimentos y fachadas con presión calibrada según el material.',
    'Recovery of driveways, terraces, paving and facades with pressure calibrated to each material.',
    240, 45000, true, 20
  ),
  (
    'carpet-cleaning', 'Limpieza de Alfombras', 'Carpet Cleaning',
    'Extracción por inyección de agua caliente para alfombras, tapetes y tapicería.',
    'Hot-water extraction for carpets, rugs and upholstery.',
    180, 28000, true, 30
  )
on conflict (code) do update set
  name_es = excluded.name_es,
  name_en = excluded.name_en,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  default_duration_minutes = excluded.default_duration_minutes,
  base_price_cents = excluded.base_price_cents,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- Retire the pre-launch services. create_public_service_request already filters
-- on is_active, so new intake for these codes fails closed from here on.
update public.service_catalog
set is_active = false
where code in ('residential-vip', 'post-construction', 'florida-control');

-- ── Store taxonomy ───────────────────────────────────────────────────
-- The storefront and admin filter products by this column; it had no index.
create index if not exists products_category_idx
  on public.products (category)
  where archived_at is null;

-- Remap the legacy free-text values written before the taxonomy existed.
update public.products set category = 'glass-cleaners' where category = 'Cuidado de cristales';
update public.products set category = 'all-purpose-cleaners' where category = 'cleaning';
update public.products set category = null where category = 'Control Florida';

commit;
