-- Local/staging demonstration data only. Never apply this file to production.

insert into public.service_catalog (
  code, name_es, name_en, description_es, description_en,
  default_duration_minutes, base_price_cents, sort_order
) values
  ('window-cleaning', 'Limpieza de Cristales', 'Window Cleaning', 'Cristales exteriores e interiores con tecnología WFP de agua pura.', 'Interior and exterior glass with WFP pure-water technology.', 180, 32000, 10),
  ('pressure-washing', 'Lavado a Presión', 'Pressure Washing', 'Recuperación de entradas, terrazas y fachadas con presión calibrada.', 'Recovery of driveways, terraces and facades with calibrated pressure.', 240, 45000, 20),
  ('carpet-cleaning', 'Limpieza de Alfombras', 'Carpet Cleaning', 'Extracción por inyección de agua caliente para alfombras y tapicería.', 'Hot-water extraction for carpets and upholstery.', 180, 28000, 30)
on conflict (code) do update set
  name_es = excluded.name_es,
  name_en = excluded.name_en,
  description_es = excluded.description_es,
  description_en = excluded.description_en,
  default_duration_minutes = excluded.default_duration_minutes,
  base_price_cents = excluded.base_price_cents,
  sort_order = excluded.sort_order;

insert into public.subscription_plans (name, description, cadence_days, base_price_cents)
values
  ('Essential', 'Mantenimiento mensual', 30, 28000),
  ('Signature', 'Mantenimiento quincenal', 14, 52000),
  ('Estate', 'Mantenimiento semanal', 7, 96000)
on conflict (name) do update set
  description = excluded.description,
  cadence_days = excluded.cadence_days,
  base_price_cents = excluded.base_price_cents;

insert into public.teams (name, capacity_size)
values ('Equipo Miami 01', 3)
on conflict (name) do update set capacity_size = excluded.capacity_size, is_active = true;

insert into public.products (
  name, slug, brand, tagline, description, detailed_description,
  price_cents, compare_at_price_cents, cost_price_cents, sale_type,
  low_stock_threshold, category, benefit_label, accent_gradient,
  specs, is_active, is_featured, sort_order
) values
  (
    'Glass Finish Kit', 'glass-finish-kit', 'DOGE Selection',
    'Acabado impecable para cristales', 'Kit concierge para mantenimiento de vidrio.',
    'Selección de herramientas para retoques entre visitas profesionales.',
    8900, 10900, 4200, 'own_stock', 5, 'glass-cleaners',
    'Selección profesional', 'from-slate-500 to-zinc-900',
    '[{"label":"Uso","value":"Cristales y espejos"},{"label":"Formato","value":"Kit"}]'::jsonb,
    true, true, 10
  ),
  (
    'Coastal Humidity Monitor', 'coastal-humidity-monitor', 'DOGE Selection',
    'Visibilidad para interiores costeros', 'Monitor recomendado para residencias de South Florida.',
    'Producto de afiliado sujeto a disponibilidad y condiciones del proveedor.',
    4900, null, null, 'amazon_affiliate', 0, 'disinfectants',
    'Recomendado', 'from-blue-900 to-slate-950',
    '[{"label":"Canal","value":"Afiliado externo"}]'::jsonb,
    true, true, 20
  )
on conflict (slug) where archived_at is null do update set
  name = excluded.name,
  price_cents = excluded.price_cents,
  sale_type = excluded.sale_type,
  is_active = excluded.is_active,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order;

insert into public.inventory_levels (product_id, on_hand)
select id, 12 from public.products where slug = 'glass-finish-kit'
on conflict (product_id) do update set on_hand = excluded.on_hand;
