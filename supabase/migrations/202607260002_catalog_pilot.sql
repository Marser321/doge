-- Public DOGE Essentials pilot catalogue.
-- These records are intentionally deployed as a migration (not seed.sql) so the
-- connected public catalogue, inventory ledger and static visual assets agree.

begin;

insert into public.products (
  name, slug, brand, tagline, description, detailed_description,
  price_cents, sale_type, low_stock_threshold, category, benefit_label,
  accent_gradient, specs, is_active, is_featured, sort_order
) values
  ('Brillo de Cristal 750 ml', 'brillo-de-cristal-750ml', 'DOGE Essentials', 'Limpieza ligera para vidrio y espejos.', 'Limpiavidrios piloto para mantenimiento cotidiano de superficies transparentes.', 'Formato de 750 ml pensado para cristales interiores y espejos. Ficha de catálogo piloto para validar imagen, detalle técnico y consultas vía concierge; no representa disponibilidad comercial definitiva.', 1400, 'whatsapp_concierge', 0, 'glass-cleaners', 'Catálogo piloto', 'from-cyan-950 to-slate-950', '[{"label":"Formato","value":"750 ml"},{"label":"Uso previsto","value":"Vidrio y espejos"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, true, 110),
  ('Multiuso Neutro 1 L', 'multiuso-neutro-1l', 'DOGE Essentials', 'Base neutra para mantenimiento diario.', 'Limpiador multiusos piloto para superficies lavables del hogar.', 'Formato de 1 litro para mantenimiento general de superficies lavables. Ficha de catálogo piloto para comprobar stock, tarjeta y flujo de orden; no representa disponibilidad comercial definitiva.', 1200, 'own_stock', 5, 'all-purpose-cleaners', 'Catálogo piloto', 'from-cyan-950 to-slate-950', '[{"label":"Formato","value":"1 L"},{"label":"Uso previsto","value":"Superficies lavables"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, false, 120),
  ('Desengrasante Cocina 650 ml', 'desengrasante-cocina-650ml', 'DOGE Essentials', 'Apoyo concentrado para zonas de cocina.', 'Desengrasante piloto destinado a rutinas de mantenimiento de cocina.', 'Formato de 650 ml para consultas de limpieza de zonas de cocina. Ficha de catálogo piloto para validar especificaciones e inventario; no representa disponibilidad comercial definitiva.', 1500, 'own_stock', 5, 'degreasers', 'Catálogo piloto', 'from-cyan-950 to-slate-950', '[{"label":"Formato","value":"650 ml"},{"label":"Uso previsto","value":"Cocina"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, false, 130),
  ('Detergente Líquido Blue Coast 2 L', 'detergente-liquido-blue-coast-2l', 'DOGE Essentials', 'Formato amplio para ciclos de lavandería.', 'Detergente líquido piloto para la categoría de lavandería.', 'Formato de 2 litros para probar navegación de lavandería, detalle técnico y órdenes asistidas. No representa disponibilidad comercial definitiva.', 1800, 'own_stock', 5, 'liquid-detergents', 'Catálogo piloto', 'from-indigo-950 to-zinc-950', '[{"label":"Formato","value":"2 L"},{"label":"Uso previsto","value":"Lavandería"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, true, 210),
  ('Cápsulas Lavado Profundo x36', 'capsulas-lavado-profundo-36', 'DOGE Essentials', 'Dosis individual para lavandería.', 'Cápsulas piloto para representar un formato de lavandería de dosis única.', 'Presentación de 36 cápsulas para validar tarjetas, filtros y consultas de catálogo. No representa disponibilidad comercial definitiva.', 2200, 'whatsapp_concierge', 0, 'laundry-pods', 'Catálogo piloto', 'from-indigo-950 to-zinc-950', '[{"label":"Formato","value":"36 cápsulas"},{"label":"Uso previsto","value":"Lavandería"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 220),
  ('Quitamanchas Oxígeno Activo 500 g', 'quitamanchas-oxigeno-activo-500g', 'DOGE Essentials', 'Formato en polvo para pruebas de stock bajo.', 'Quitamanchas piloto para comprobar señales de inventario bajo.', 'Presentación de 500 g con inventario deliberadamente bajo para validar alertas operativas. No representa disponibilidad comercial definitiva.', 1300, 'own_stock', 5, 'stain-removers', 'Catálogo piloto', 'from-indigo-950 to-zinc-950', '[{"label":"Formato","value":"500 g"},{"label":"Uso previsto","value":"Lavandería"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, false, 230),
  ('Toalla de Papel Ultra x6', 'toalla-de-papel-ultra-6', 'DOGE Essentials', 'Reserva práctica de papel absorbente.', 'Toallas de papel piloto para higiene y mantenimiento cotidiano.', 'Presentación de seis rollos para validar navegación de papel e higiene, stock y órdenes. No representa disponibilidad comercial definitiva.', 1600, 'own_stock', 5, 'paper-towels', 'Catálogo piloto', 'from-stone-800 to-zinc-950', '[{"label":"Formato","value":"6 rollos"},{"label":"Uso previsto","value":"Higiene y mantenimiento"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, true, 310),
  ('Papel Higiénico Soft Reserve x12', 'papel-higienico-soft-reserve-12', 'DOGE Essentials', 'Reserva de doce rollos para el hogar.', 'Papel higiénico piloto para la categoría de higiene.', 'Presentación de doce rollos para validar ficha, filtros y consulta por concierge. No representa disponibilidad comercial definitiva.', 1800, 'whatsapp_concierge', 0, 'toilet-paper', 'Catálogo piloto', 'from-stone-800 to-zinc-950', '[{"label":"Formato","value":"12 rollos"},{"label":"Uso previsto","value":"Higiene personal"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 320),
  ('Pañuelos Soft Reserve x6', 'panuelos-soft-reserve-6', 'DOGE Essentials', 'Seis cajas para espacios de uso diario.', 'Pañuelos faciales piloto con presentación de seis cajas.', 'Presentación de seis cajas para validar catálogo de papel e higiene. No representa disponibilidad comercial definitiva.', 1200, 'whatsapp_concierge', 0, 'facial-tissues', 'Catálogo piloto', 'from-stone-800 to-zinc-950', '[{"label":"Formato","value":"6 cajas"},{"label":"Uso previsto","value":"Higiene personal"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 330),
  ('Bolsas Ultra Resistentes 13 gal x40', 'bolsas-ultra-resistentes-13gal-40', 'DOGE Essentials', 'Formato de uso cotidiano para residuos.', 'Bolsas de residuos piloto para la categoría de desechables.', 'Presentación de cuarenta bolsas de 13 galones para validar inventario y orden asistida. No representa disponibilidad comercial definitiva.', 1700, 'own_stock', 5, 'trash-bags', 'Catálogo piloto', 'from-teal-950 to-zinc-950', '[{"label":"Formato","value":"40 bolsas · 13 gal"},{"label":"Uso previsto","value":"Residuos"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, false, 410),
  ('Guantes Nitrilo Black x100', 'guantes-nitrilo-black-100', 'DOGE Essentials', 'Estado agotado para validar el storefront.', 'Guantes de nitrilo piloto configurados sin unidades disponibles.', 'Presentación de cien guantes con stock inicial cero para validar el estado agotado en tienda y CRM. No representa disponibilidad comercial definitiva.', 2200, 'own_stock', 5, 'disposable-gloves', 'Catálogo piloto', 'from-teal-950 to-zinc-950', '[{"label":"Formato","value":"100 unidades"},{"label":"Uso previsto","value":"Protección desechable"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, false, 420),
  ('Vajilla Compostable x50', 'vajilla-compostable-50', 'DOGE Essentials', 'Set para reuniones y eventos pequeños.', 'Vajilla compostable piloto para la categoría de desechables.', 'Presentación de cincuenta servicios para validar detalle y consulta de concierge. No representa disponibilidad comercial definitiva.', 3400, 'whatsapp_concierge', 0, 'disposable-tableware', 'Catálogo piloto', 'from-teal-950 to-zinc-950', '[{"label":"Formato","value":"50 servicios"},{"label":"Uso previsto","value":"Eventos y reuniones"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 430),
  ('Jabón corporal Ocean Linen 500 ml', 'jabon-corporal-ocean-linen-500ml', 'DOGE Essentials', 'Formato de cuidado diario.', 'Jabón corporal piloto para la categoría de aseo personal.', 'Presentación de 500 ml para validar contenido de cuidado personal y consulta de catálogo. No representa disponibilidad comercial definitiva.', 1600, 'whatsapp_concierge', 0, 'body-soap', 'Catálogo piloto', 'from-rose-950 to-zinc-950', '[{"label":"Formato","value":"500 ml"},{"label":"Uso previsto","value":"Aseo personal"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 510),
  ('Shampoo Coastal Balance 450 ml', 'shampoo-coastal-balance-450ml', 'DOGE Essentials', 'Formato de rutina personal.', 'Shampoo piloto para la categoría de aseo personal.', 'Presentación de 450 ml para validar imagen, ficha y navegación de aseo personal. No representa disponibilidad comercial definitiva.', 1700, 'whatsapp_concierge', 0, 'shampoo', 'Catálogo piloto', 'from-rose-950 to-zinc-950', '[{"label":"Formato","value":"450 ml"},{"label":"Uso previsto","value":"Aseo personal"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 520),
  ('Pasta dental Fresh Mint 2-pack', 'pasta-dental-fresh-mint-2', 'DOGE Essentials', 'Par de tubos para la rutina diaria.', 'Pasta dental piloto para comprobar stock y ficha de aseo personal.', 'Presentación doble para validar catálogo, orden asistida e inventario. No representa disponibilidad comercial definitiva.', 1000, 'own_stock', 5, 'toothpaste', 'Catálogo piloto', 'from-rose-950 to-zinc-950', '[{"label":"Formato","value":"2 tubos"},{"label":"Uso previsto","value":"Aseo personal"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, false, 530),
  ('Pañales Comfort Fit T3 x96', 'panales-comfort-fit-t3-96', 'DOGE Essentials', 'Reserva amplia para cuidado del bebé.', 'Pañales piloto para la categoría de cuidado del bebé.', 'Presentación de 96 unidades para validar destacados, inventario y flujo de orden. No representa disponibilidad comercial definitiva.', 3800, 'own_stock', 5, 'diapers', 'Catálogo piloto', 'from-sky-950 to-zinc-950', '[{"label":"Formato","value":"96 unidades · talla 3"},{"label":"Uso previsto","value":"Cuidado del bebé"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, true, 610),
  ('Toallitas Gentle Care x6', 'toallitas-gentle-care-6', 'DOGE Essentials', 'Seis paquetes para cuidado cotidiano.', 'Toallitas piloto para la categoría de cuidado del bebé.', 'Presentación de seis paquetes para validar filtros y consultas de concierge. No representa disponibilidad comercial definitiva.', 1800, 'whatsapp_concierge', 0, 'baby-wipes', 'Catálogo piloto', 'from-sky-950 to-zinc-950', '[{"label":"Formato","value":"6 paquetes"},{"label":"Uso previsto","value":"Cuidado del bebé"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 620),
  ('Gel de baño Baby Cloud 400 ml', 'gel-de-bano-baby-cloud-400ml', 'DOGE Essentials', 'Formato suave para rutina de baño.', 'Gel de baño piloto para validar un segundo estado de stock bajo.', 'Presentación de 400 ml con inventario deliberadamente bajo para comprobar alertas operativas. No representa disponibilidad comercial definitiva.', 1400, 'own_stock', 5, 'baby-bath', 'Catálogo piloto', 'from-sky-950 to-zinc-950', '[{"label":"Formato","value":"400 ml"},{"label":"Uso previsto","value":"Baño del bebé"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, false, 630),
  ('Shampoo Pet Fresh 500 ml', 'shampoo-pet-fresh-500ml', 'DOGE Essentials', 'Formato de higiene para mascotas.', 'Shampoo piloto para la categoría de cuidado de mascotas.', 'Presentación de 500 ml para validar navegación de mascotas y consulta de catálogo. No representa disponibilidad comercial definitiva.', 1900, 'whatsapp_concierge', 0, 'pet-shampoo', 'Catálogo piloto', 'from-emerald-950 to-zinc-950', '[{"label":"Formato","value":"500 ml"},{"label":"Uso previsto","value":"Higiene de mascotas"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 710),
  ('Toallitas Paws Clean x100', 'toallitas-paws-clean-100', 'DOGE Essentials', 'Reserva amplia para higiene de mascotas.', 'Toallitas piloto para validar stock de cuidado de mascotas.', 'Presentación de 100 unidades para validar imagen, inventario y orden asistida. No representa disponibilidad comercial definitiva.', 1400, 'own_stock', 5, 'pet-wipes', 'Catálogo piloto', 'from-emerald-950 to-zinc-950', '[{"label":"Formato","value":"100 unidades"},{"label":"Uso previsto","value":"Higiene de mascotas"},{"label":"Canal","value":"Stock propio"}]'::jsonb, true, false, 720),
  ('Bolsas paseo Bio x16 rollos', 'bolsas-paseo-bio-16', 'DOGE Essentials', 'Rollos compactos para paseos cotidianos.', 'Bolsas piloto para la categoría de mascotas.', 'Presentación de 16 rollos para validar ficha y consulta de concierge. No representa disponibilidad comercial definitiva.', 1300, 'whatsapp_concierge', 0, 'waste-bags', 'Catálogo piloto', 'from-emerald-950 to-zinc-950', '[{"label":"Formato","value":"16 rollos"},{"label":"Uso previsto","value":"Paseos con mascotas"},{"label":"Canal","value":"Concierge"}]'::jsonb, true, false, 730)
on conflict (slug) where archived_at is null do nothing;

with initial_inventory(slug, on_hand) as (
  values
    ('multiuso-neutro-1l', 18), ('desengrasante-cocina-650ml', 9),
    ('detergente-liquido-blue-coast-2l', 15), ('quitamanchas-oxigeno-activo-500g', 3),
    ('toalla-de-papel-ultra-6', 20), ('bolsas-ultra-resistentes-13gal-40', 11),
    ('guantes-nitrilo-black-100', 0), ('pasta-dental-fresh-mint-2', 24),
    ('panales-comfort-fit-t3-96', 8), ('gel-de-bano-baby-cloud-400ml', 2),
    ('toallitas-paws-clean-100', 12)
)
insert into public.inventory_levels (product_id, on_hand)
select products.id, initial_inventory.on_hand
from initial_inventory join public.products on products.slug = initial_inventory.slug
on conflict (product_id) do nothing;

with initial_inventory(slug, on_hand) as (
  values
    ('multiuso-neutro-1l', 18), ('desengrasante-cocina-650ml', 9),
    ('detergente-liquido-blue-coast-2l', 15), ('quitamanchas-oxigeno-activo-500g', 3),
    ('toalla-de-papel-ultra-6', 20), ('bolsas-ultra-resistentes-13gal-40', 11),
    ('pasta-dental-fresh-mint-2', 24), ('panales-comfort-fit-t3-96', 8),
    ('gel-de-bano-baby-cloud-400ml', 2), ('toallitas-paws-clean-100', 12)
)
insert into public.inventory_movements (product_id, quantity_delta, movement_type, reference_type, note)
select products.id, initial_inventory.on_hand, 'receipt', 'catalog-pilot', 'Inventario inicial catálogo piloto'
from initial_inventory join public.products on products.slug = initial_inventory.slug
where not exists (
  select 1 from public.inventory_movements movements
  where movements.product_id = products.id and movements.reference_type = 'catalog-pilot'
);

with images(slug, image_url, alt_text) as (
  values
    ('brillo-de-cristal-750ml', '/products/catalog-pilot/brillo-de-cristal-750ml.webp', 'Botella sin marca de limpiavidrios sobre un pedestal de piedra.'),
    ('multiuso-neutro-1l', '/products/catalog-pilot/multiuso-neutro-1l.webp', 'Botella sin marca de limpiador multiusos sobre un pedestal.'),
    ('desengrasante-cocina-650ml', '/products/catalog-pilot/desengrasante-cocina-650ml.webp', 'Botella sin marca de desengrasante sobre acero oscuro.'),
    ('detergente-liquido-blue-coast-2l', '/products/catalog-pilot/detergente-liquido-blue-coast-2l.webp', 'Botella azul sin marca de detergente líquido.'),
    ('capsulas-lavado-profundo-36', '/products/catalog-pilot/capsulas-lavado-profundo-36.webp', 'Contenedor sin marca con cápsulas de lavandería.'),
    ('quitamanchas-oxigeno-activo-500g', '/products/catalog-pilot/quitamanchas-oxigeno-activo-500g.webp', 'Tarro sin marca de polvo quitamanchas con cuchara.'),
    ('toalla-de-papel-ultra-6', '/products/catalog-pilot/toalla-de-papel-ultra-6.webp', 'Paquete sin marca de toallas de papel.'),
    ('papel-higienico-soft-reserve-12', '/products/catalog-pilot/papel-higienico-soft-reserve-12.webp', 'Paquete sin marca de doce rollos de papel higiénico.'),
    ('panuelos-soft-reserve-6', '/products/catalog-pilot/panuelos-soft-reserve-6.webp', 'Cajas sin marca de pañuelos faciales.'),
    ('bolsas-ultra-resistentes-13gal-40', '/products/catalog-pilot/bolsas-ultra-resistentes-13gal-40.webp', 'Rollo de bolsas de residuos oscuras sin marca.'),
    ('guantes-nitrilo-black-100', '/products/catalog-pilot/guantes-nitrilo-black-100.webp', 'Caja sin marca de guantes de nitrilo negros.'),
    ('vajilla-compostable-50', '/products/catalog-pilot/vajilla-compostable-50.webp', 'Vajilla compostable sin marca con cubiertos de madera.'),
    ('jabon-corporal-ocean-linen-500ml', '/products/catalog-pilot/jabon-corporal-ocean-linen-500ml.webp', 'Botella sin marca de jabón corporal con dispensador.'),
    ('shampoo-coastal-balance-450ml', '/products/catalog-pilot/shampoo-coastal-balance-450ml.webp', 'Botella sin marca de shampoo oscuro.'),
    ('pasta-dental-fresh-mint-2', '/products/catalog-pilot/pasta-dental-fresh-mint-2.webp', 'Dos tubos sin marca de pasta dental junto a cepillos.'),
    ('panales-comfort-fit-t3-96', '/products/catalog-pilot/panales-comfort-fit-t3-96.webp', 'Paquete sin marca de pañales de tonos blanco y azul.'),
    ('toallitas-gentle-care-6', '/products/catalog-pilot/toallitas-gentle-care-6.webp', 'Paquete sin marca de toallitas para bebé.'),
    ('gel-de-bano-baby-cloud-400ml', '/products/catalog-pilot/gel-de-bano-baby-cloud-400ml.webp', 'Botella sin marca de gel de baño para bebé.'),
    ('shampoo-pet-fresh-500ml', '/products/catalog-pilot/shampoo-pet-fresh-500ml.webp', 'Botella verde sin marca de shampoo para mascotas.'),
    ('toallitas-paws-clean-100', '/products/catalog-pilot/toallitas-paws-clean-100.webp', 'Paquete sin marca de toallitas para mascotas.'),
    ('bolsas-paseo-bio-16', '/products/catalog-pilot/bolsas-paseo-bio-16.webp', 'Rollo de bolsas biodegradables y dispensador sin marca.')
)
insert into public.product_images (product_id, image_url, alt_text, is_primary, sort_order)
select products.id, images.image_url, images.alt_text, true, 0
from images join public.products on products.slug = images.slug
where not exists (
  select 1 from public.product_images current
  where current.product_id = products.id and current.image_url = images.image_url
);

commit;
