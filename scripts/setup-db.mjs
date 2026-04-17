#!/usr/bin/env node
// DOGE Platform — InsForge DB Setup (final)
// Valid types: string, integer, boolean, datetime, date, json, uuid
const BASE = 'https://ue7axihx.us-east.insforge.app';
const KEY = 'ik_772d9ef6fcdf55159db33d07c9becff1';
const H = { 'Content-Type': 'application/json', 'apikey': KEY, 'Authorization': `Bearer ${KEY}` };

const ct = async (name, cols) => {
  const r = await fetch(`${BASE}/api/database/tables`, { method: 'POST', headers: H, body: JSON.stringify({ tableName: name, columns: cols, enableRls: false }) });
  const d = await r.json();
  console.log(r.ok ? `  ✅ ${name}` : `  ❌ ${name}: ${d.message}`);
  return r.ok;
};
const ins = async (table, records) => {
  const r = await fetch(`${BASE}/api/database/records/${table}`, { method: 'POST', headers: {...H, 'Prefer': 'return=representation'}, body: JSON.stringify(records) });
  const d = await r.json();
  if (r.ok) { const a = Array.isArray(d) ? d : [d]; console.log(`  ✅ ${table}: ${a.length} rows`); return a; }
  console.log(`  ❌ ${table}: ${d.message || JSON.stringify(d)}`); return null;
};
const col = (n, t, extra = {}) => ({ columnName: n, type: t, isNullable: false, isUnique: false, ...extra });

(async () => {
  console.log('🚀 Creating tables...\n');

  await ct('clients', [
    col('name', 'string'), col('company', 'string', {isNullable:true}), col('email', 'string', {isNullable:true, isUnique:true}),
    col('phone', 'string', {isNullable:true}), col('address', 'string', {isNullable:true}),
    col('status', 'string'), col('lifetime_value', 'integer'), col('notes', 'string', {isNullable:true}),
  ]);

  await ct('subscription_tiers', [
    col('name', 'string', {isUnique:true}), col('price', 'integer'),
    col('frequency', 'string'), col('features', 'json'), col('is_active', 'boolean'),
  ]);

  await ct('subscriptions', [
    col('client_id', 'uuid', {isNullable:true}), col('tier_id', 'uuid', {isNullable:true}),
    col('status', 'string'), col('mrr', 'integer'),
    col('next_billing_date', 'date', {isNullable:true}),
    col('started_at', 'datetime'), col('cancelled_at', 'datetime', {isNullable:true}),
  ]);

  await ct('offers', [
    col('title', 'string'), col('code', 'string', {isUnique:true}),
    col('discount_percent', 'integer', {isNullable:true}), col('discount_type', 'string'),
    col('discount_amount', 'integer'), col('target_audience', 'string'),
    col('usage_count', 'integer'), col('max_uses', 'integer', {isNullable:true}),
    col('status', 'string'), col('expires_at', 'date', {isNullable:true}), col('applies_to', 'string'),
  ]);

  await ct('products', [
    col('name', 'string'), col('slug', 'string', {isUnique:true}), col('brand', 'string', {isNullable:true}),
    col('tagline', 'string', {isNullable:true}), col('description', 'string', {isNullable:true}),
    col('detailed_description', 'string', {isNullable:true}),
    col('price', 'integer'), col('compare_at_price', 'integer', {isNullable:true}),
    col('cost_price', 'integer', {isNullable:true}),
    col('sale_type', 'string'), col('amazon_affiliate_url', 'string', {isNullable:true}),
    col('amazon_asin', 'string', {isNullable:true}),
    col('stock_quantity', 'integer'), col('low_stock_threshold', 'integer'),
    col('category', 'string', {isNullable:true}), col('benefit_label', 'string', {isNullable:true}),
    col('accent_gradient', 'string', {isNullable:true}), col('specs', 'json'),
    col('is_active', 'boolean'), col('is_featured', 'boolean'), col('sort_order', 'integer'),
  ]);

  await ct('product_images', [
    col('product_id', 'uuid'), col('image_url', 'string'),
    col('alt_text', 'string', {isNullable:true}), col('is_primary', 'boolean'), col('sort_order', 'integer'),
  ]);

  await ct('orders', [
    col('order_number', 'string', {isUnique:true}), col('client_id', 'uuid', {isNullable:true}),
    col('customer_name', 'string'), col('customer_email', 'string', {isNullable:true}),
    col('customer_phone', 'string', {isNullable:true}), col('shipping_address', 'string', {isNullable:true}),
    col('order_type', 'string'), col('subtotal', 'integer'), col('discount_amount', 'integer'),
    col('offer_id', 'uuid', {isNullable:true}), col('shipping_cost', 'integer'),
    col('total', 'integer'), col('status', 'string'), col('payment_status', 'string'),
    col('notes', 'string', {isNullable:true}),
  ]);

  await ct('order_items', [
    col('order_id', 'uuid'), col('product_id', 'uuid', {isNullable:true}),
    col('product_name', 'string'), col('quantity', 'integer'),
    col('unit_price', 'integer'), col('total_price', 'integer'), col('sale_type', 'string'),
  ]);

  await ct('service_requests', [
    col('client_id', 'uuid', {isNullable:true}), col('service_type', 'string'),
    col('property_type', 'string', {isNullable:true}), col('property_sqft', 'integer', {isNullable:true}),
    col('rooms', 'integer', {isNullable:true}), col('bathrooms', 'integer', {isNullable:true}),
    col('subscription_plan', 'string', {isNullable:true}), col('estimated_price', 'integer', {isNullable:true}),
    col('scheduled_date', 'datetime', {isNullable:true}), col('status', 'string'),
    col('crew_assigned', 'string', {isNullable:true}), col('notes', 'string', {isNullable:true}),
    col('photos', 'json'),
  ]);

  await ct('kpi_snapshots', [
    col('metric_name', 'string'), col('metric_value', 'integer'),
    col('previous_value', 'integer', {isNullable:true}), col('snapshot_date', 'date'),
  ]);

  console.log('\n📊 Seeding data...\n');

  const clients = await ins('clients', [
    { name:'Alvaro Hernandez', company:'Ocean View Condos', email:'alvaro@oceanview.com', phone:'+1-786-555-0101', address:'1000 Brickell Ave, Miami FL', status:'VIP', lifetime_value:42500 },
    { name:'Sarah Jenkins', company:'Brickell Financial Hub', email:'s.jenkins@brickellfin.com', phone:'+1-305-555-0202', address:'800 Brickell Ave, Miami FL', status:'Corporate', lifetime_value:18200 },
    { name:'Marcus Wong', company:'Luxury Auto Dealership', email:'mwong@luxuryauto.miami', phone:'+1-305-555-0303', address:'2020 NW 2nd Ave, Miami FL', status:'Corporate', lifetime_value:9800 },
    { name:'Elena Rostova', company:'Private Residence', email:'elena.r@gmail.com', phone:'+1-786-555-0404', address:'3400 SW 27th Ave, Coconut Grove FL', status:'VIP', lifetime_value:24500 },
    { name:'David Smith', company:'Wynwood Tech Space', email:'dsmith@wynwoodtech.io', phone:'+1-305-555-0505', address:'333 NW 25th St, Wynwood FL', status:'Standard', lifetime_value:3200 },
  ]);

  const tiers = await ins('subscription_tiers', [
    { name:'Bronce', price:150, frequency:'monthly', features:['1 Sanitación Mensual','Acceso a Agenda','Soporte Estándar'], is_active:true },
    { name:'Plata', price:250, frequency:'biweekly', features:['2 Sanitaciones/Mes','Prioridad de Agenda','Insumos Premium'], is_active:true },
    { name:'Oro VIP', price:450, frequency:'weekly', features:['4 Sanitaciones/Mes','Turnos VIP Fijos','Auditoría Fotográfica'], is_active:true },
  ]);

  if (clients?.length >= 5 && tiers?.length >= 3) {
    await ins('subscriptions', [
      { client_id:clients[0].id, tier_id:tiers[2].id, status:'Active', mrr:8500, next_billing_date:'2026-05-01', started_at:new Date().toISOString() },
      { client_id:clients[1].id, tier_id:tiers[2].id, status:'Active', mrr:4200, next_billing_date:'2026-04-28', started_at:new Date().toISOString() },
      { client_id:clients[2].id, tier_id:tiers[1].id, status:'Pending', mrr:2800, started_at:new Date().toISOString() },
      { client_id:clients[3].id, tier_id:tiers[1].id, status:'Active', mrr:1500, next_billing_date:'2026-05-05', started_at:new Date().toISOString() },
      { client_id:clients[4].id, tier_id:tiers[0].id, status:'Paused', mrr:1500, started_at:new Date().toISOString() },
      { client_id:clients[0].id, tier_id:tiers[0].id, status:'Cancelled', mrr:0, started_at:'2025-01-01T00:00:00Z', cancelled_at:'2026-03-15T00:00:00Z' },
    ]);
  }

  await ins('offers', [
    { title:'Free Window Robot Add-on', code:'TITANIUM-ROBOT', discount_percent:100, discount_type:'percent', discount_amount:0, target_audience:'Titanium Tiers', usage_count:45, status:'Active', expires_at:'2026-12-31', applies_to:'services' },
    { title:'20% Off Deep Sanitize', code:'DEEPRELAX20', discount_percent:20, discount_type:'percent', discount_amount:0, target_audience:'All Tiers', usage_count:128, status:'Active', expires_at:'2026-08-31', applies_to:'services' },
    { title:'Yacht Compounding Upgrade', code:'YACHT-PLUS', discount_percent:15, discount_type:'percent', discount_amount:0, target_audience:'Gold & Above', usage_count:12, status:'Active', applies_to:'services' },
    { title:'First Month -50%', code:'NEWDOGE50', discount_percent:50, discount_type:'percent', discount_amount:0, target_audience:'New Clients', usage_count:412, status:'Inactive', expires_at:'2026-01-01', applies_to:'both' },
  ]);

  const products = await ins('products', [
    { name:'V15 Detect Absolute', slug:'dyson_v15', brand:'Dyson', tagline:'Sensor Piezo de Polvo Forense', description:'El estándar de oro en aspiración de lujo.', detailed_description:'Utilizado por equipos tácticos para auditorías de polvo fino.', price:749, compare_at_price:null, cost_price:null, sale_type:'amazon_affiliate', amazon_affiliate_url:'https://www.amazon.com/dp/B0CY4K3XTK?tag=dogesm-20', amazon_asin:'B0CY4K3XTK', stock_quantity:0, low_stock_threshold:5, category:'cleaning', benefit_label:'Garantía Extendida DOGE', accent_gradient:'from-purple-600 to-purple-900', specs:[{label:'Succión',value:'240AW'},{label:'Autonomía',value:'60 min'},{label:'Peso',value:'3.1kg'},{label:'Filtrado',value:'99.99%'}], is_active:true, is_featured:true, sort_order:1 },
    { name:'SC 3 Carbon Elite', slug:'karcher_sc3', brand:'Kärcher', tagline:'Vapor Continuo Sin Químicos', description:'Limpieza por vapor de grado industrial.', detailed_description:'Herramienta fundamental para sanitización profunda.', price:199, compare_at_price:null, cost_price:null, sale_type:'amazon_affiliate', amazon_affiliate_url:'https://www.amazon.com/dp/B07SPLTDGS?tag=dogesm-20', amazon_asin:'B07SPLTDGS', stock_quantity:0, low_stock_threshold:5, category:'cleaning', benefit_label:'DOGE Training Included', accent_gradient:'from-yellow-400 to-yellow-700', specs:[{label:'Presión',value:'3.5 Bar'},{label:'Calentamiento',value:'30 seg'},{label:'Depósito',value:'1.0L'},{label:'Alcance',value:'75m²'}], is_active:true, is_featured:true, sort_order:2 },
    { name:'Big Green Professional', slug:'bissell_big_green', brand:'Bissell', tagline:'Extracción Profunda Táctica', description:'La máquina definitiva para alfombras en Miami.', detailed_description:'Recomendación para mantenimiento preventivo de suites.', price:430, compare_at_price:null, cost_price:null, sale_type:'amazon_affiliate', amazon_affiliate_url:'https://www.amazon.com/dp/B00450U6CS?tag=dogesm-20', amazon_asin:'B00450U6CS', stock_quantity:0, low_stock_threshold:5, category:'cleaning', benefit_label:'Insumos Químicos Kit Pro', accent_gradient:'from-green-600 to-green-900', specs:[{label:'Motor',value:'Commercial'},{label:'Tanque',value:'1.75 Gal'},{label:'Cepillo',value:'PowerBrush'},{label:'Limpieza',value:'Xtra Large'}], is_active:true, is_featured:true, sort_order:3 },
    { name:'Nano-Sellador de Hongos', slug:'mold_control', brand:'DOGE Lab', tagline:'Protección Química Prolongada', description:'Fórmula concentrada inhibe esporas.', detailed_description:'Diseñado para el clima del sur de Florida.', price:85, compare_at_price:null, cost_price:null, sale_type:'own_stock', amazon_affiliate_url:null, amazon_asin:null, stock_quantity:48, low_stock_threshold:10, category:'humidity', benefit_label:'Exclusivo DOGE.S.M LLC', accent_gradient:'from-red-600 to-red-900', specs:[{label:'Duración',value:'12 Meses'},{label:'Secado',value:'15 Min'},{label:'Base',value:'Nano-Titanio'},{label:'Olor',value:'Neutro'}], is_active:true, is_featured:true, sort_order:4 },
  ]);

  if (clients?.length >= 3) {
    await ins('orders', [
      { order_number:'ORD-001', client_id:clients[0].id, customer_name:'Alvaro Hernandez', customer_email:'alvaro@oceanview.com', customer_phone:'+1-786-555-0101', shipping_address:'1000 Brickell Ave, Miami FL', order_type:'direct_purchase', subtotal:170, discount_amount:0, shipping_cost:0, total:170, status:'Delivered', payment_status:'Paid' },
      { order_number:'ORD-002', client_id:clients[3].id, customer_name:'Elena Rostova', customer_email:'elena.r@gmail.com', customer_phone:'+1-786-555-0404', shipping_address:'3400 SW 27th Ave, Coconut Grove FL', order_type:'direct_purchase', subtotal:85, discount_amount:0, shipping_cost:15, total:100, status:'Shipped', payment_status:'Paid' },
      { order_number:'ORD-003', client_id:clients[1].id, customer_name:'Sarah Jenkins', customer_email:'s.jenkins@brickellfin.com', customer_phone:'+1-305-555-0202', shipping_address:'800 Brickell Ave, Miami FL', order_type:'amazon_redirect', subtotal:749, discount_amount:0, shipping_cost:0, total:749, status:'Pending', payment_status:'Pending' },
    ]);
  }

  await ins('kpi_snapshots', [
    { metric_name:'mrr', metric_value:18500, previous_value:16150, snapshot_date:'2026-04-12' },
    { metric_name:'active_subscriptions', metric_value:3, previous_value:2, snapshot_date:'2026-04-12' },
    { metric_name:'total_clients', metric_value:5, previous_value:4, snapshot_date:'2026-04-12' },
    { metric_name:'service_volume', metric_value:24, previous_value:22, snapshot_date:'2026-04-12' },
    { metric_name:'total_orders', metric_value:3, previous_value:1, snapshot_date:'2026-04-12' },
    { metric_name:'store_revenue', metric_value:1019, previous_value:170, snapshot_date:'2026-04-12' },
  ]);

  console.log('\n🎉 Done!');
})();
