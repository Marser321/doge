import 'server-only';

import { createHash, randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  Appointment,
  Client,
  ClientDetail,
  CommerceIntent,
  DashboardSummary,
  InventoryRow,
  Offer,
  Product,
  Quote,
  QuoteItem,
  RequestStatus,
  ServiceRequest,
  StaffProfile,
  StaffRole,
  Subscription,
  Team,
} from '@/lib/types';
import { newYorkDate, newYorkLocalToIso } from '@/lib/domain';
import { createUserSupabase, getServiceSupabase } from './supabase';

type DbError = { message?: string; code?: string; details?: string } | null;

function assertResult<T>(result: { data: T | null; error: DbError }, notFound = 'No se encontró el recurso solicitado.'): T {
  if (result.error) throw new Error(result.error.message || 'Supabase rechazó la operación.');
  if (result.data === null) throw new Error(notFound);
  return result.data;
}

function cents(value: unknown) {
  const number = typeof value === 'number' ? value : Number(value || 0);
  return Math.round(number * 100);
}

function dollars(value: unknown) {
  return Number(value || 0) / 100;
}

function clientDto(row: Record<string, unknown>): Client {
  const segment = String(row.segment || 'standard');
  return {
    id: String(row.id),
    name: String(row.name || ''),
    company: typeof row.company === 'string' ? row.company : null,
    email: typeof row.email === 'string' ? row.email : null,
    phone: typeof row.phone === 'string' ? row.phone : null,
    address: typeof row.billing_address === 'string' ? row.billing_address : null,
    status: segment === 'vip' ? 'VIP' : segment === 'corporate' ? 'Corporate' : 'Standard',
    lifetime_value: dollars(row.lifetime_value_cents),
    notes: typeof row.notes === 'string' ? row.notes : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    archived_at: typeof row.archived_at === 'string' ? row.archived_at : null,
  };
}

function productDto(row: Record<string, unknown>, staff: boolean): Product {
  const level = Array.isArray(row.inventory_levels)
    ? row.inventory_levels[0] as Record<string, unknown> | undefined
    : row.inventory_levels as Record<string, unknown> | null;
  const images = Array.isArray(row.product_images)
    ? row.product_images.map((image) => {
      const value = image as Record<string, unknown>;
      return {
        id: typeof value.id === 'string' ? value.id : undefined,
        image_url: String(value.image_url || ''),
        alt_text: typeof value.alt_text === 'string' ? value.alt_text : null,
        is_primary: Boolean(value.is_primary),
      };
    })
    : [];
  return {
    id: String(row.id),
    name: String(row.name || ''),
    slug: String(row.slug || ''),
    brand: typeof row.brand === 'string' ? row.brand : null,
    tagline: typeof row.tagline === 'string' ? row.tagline : null,
    description: typeof row.description === 'string' ? row.description : null,
    detailed_description: typeof row.detailed_description === 'string' ? row.detailed_description : null,
    price: dollars(row.price_cents),
    compare_at_price: row.compare_at_price_cents === null ? null : dollars(row.compare_at_price_cents),
    ...(staff ? { cost_price: row.cost_price_cents === null ? null : dollars(row.cost_price_cents) } : {}),
    sale_type: row.sale_type as Product['sale_type'],
    amazon_affiliate_url: typeof row.affiliate_url === 'string' ? row.affiliate_url : null,
    ...(staff ? { amazon_asin: typeof row.affiliate_asin === 'string' ? row.affiliate_asin : null } : {}),
    available: row.sale_type !== 'own_stock' || Number(level?.on_hand || 0) > 0,
    ...(staff ? {
      stock_quantity: Number(level?.on_hand || 0),
      low_stock_threshold: Number(row.low_stock_threshold || 0),
    } : {}),
    category: typeof row.category === 'string' ? row.category : null,
    benefit_label: typeof row.benefit_label === 'string' ? row.benefit_label : null,
    accent_gradient: typeof row.accent_gradient === 'string' ? row.accent_gradient : null,
    specs: Array.isArray(row.specs) ? row.specs as Product['specs'] : [],
    product_images: images,
    is_active: Boolean(row.is_active),
    is_featured: Boolean(row.is_featured),
    sort_order: Number(row.sort_order || 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  } as Product;
}

function subscriptionDto(row: Record<string, unknown>): Subscription {
  const client = row.client && typeof row.client === 'object' ? clientDto(row.client as Record<string, unknown>) : undefined;
  const plan = row.plan && typeof row.plan === 'object' ? row.plan as Record<string, unknown> : null;
  const rawStatus = String(row.status || 'pending');
  return {
    id: String(row.id),
    client_id: typeof row.client_id === 'string' ? row.client_id : null,
    tier_id: typeof row.plan_id === 'string' ? row.plan_id : null,
    property_id: typeof row.property_id === 'string' ? row.property_id : null,
    preferred_weekday: row.preferred_weekday === null ? null : Number(row.preferred_weekday),
    status: rawStatus === 'active' ? 'Active' : rawStatus === 'paused' ? 'Paused' : rawStatus === 'cancelled' ? 'Cancelled' : 'Pending',
    mrr: dollars(row.monthly_value_cents),
    next_billing_date: typeof row.next_occurrence_date === 'string' ? row.next_occurrence_date : null,
    started_at: String(row.started_on || row.created_at),
    cancelled_at: typeof row.ended_on === 'string' ? row.ended_on : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    client,
    tier: plan ? {
      id: String(plan.id),
      name: String(plan.name),
      price: dollars(plan.base_price_cents),
      frequency: `${Number(plan.cadence_days)} días`,
      features: [],
      is_active: Boolean(plan.is_active),
      created_at: String(plan.created_at),
    } : undefined,
  };
}

function offerDto(row: Record<string, unknown>): Offer {
  return {
    id: String(row.id),
    title: String(row.title || ''),
    code: String(row.code || ''),
    discount_percent: row.discount_basis_points === null ? null : Number(row.discount_basis_points || 0) / 100,
    discount_type: Number(row.discount_cents || 0) > 0 ? 'fixed_amount' : 'percent',
    discount_amount: dollars(row.discount_cents),
    target_audience: 'Todos',
    usage_count: Number(row.usage_count || 0),
    max_uses: row.max_uses === null ? null : Number(row.max_uses),
    status: row.is_active ? 'Active' : 'Inactive',
    expires_at: typeof row.expires_at === 'string' ? row.expires_at : null,
    applies_to: row.applies_to as Offer['applies_to'],
    created_at: String(row.created_at),
  };
}

async function staffDb() {
  return createUserSupabase();
}

export async function listProducts(options: {
  featured?: boolean;
  category?: string;
  exclude?: string;
  staff?: boolean;
}) {
  const db = options.staff ? await staffDb() : getServiceSupabase();
  let query = db
    .from('products')
    .select('*, product_images(*), inventory_levels(on_hand)')
    .is('archived_at', null)
    .order('sort_order', { ascending: true })
    .limit(300);
  if (!options.staff) query = query.eq('is_active', true);
  if (options.featured) query = query.eq('is_featured', true);
  if (options.category) query = query.eq('category', options.category);
  if (options.exclude) query = query.neq('id', options.exclude);
  const rows = assertResult<Record<string, unknown>[]>(await query);
  return rows.map((row) => productDto(row, Boolean(options.staff)));
}

export async function getProductBySlug(slug: string, staff = false) {
  const db = staff ? await staffDb() : getServiceSupabase();
  let query = db
    .from('products')
    .select('*, product_images(*), inventory_levels(on_hand)')
    .eq('slug', slug)
    .is('archived_at', null);
  if (!staff) query = query.eq('is_active', true);
  return productDto(assertResult<Record<string, unknown>>(await query.maybeSingle(), 'Producto no encontrado.'), staff);
}

export async function listClients() {
  const db = await staffDb();
  const rows = assertResult<Record<string, unknown>[]>(
    await db.from('clients').select('*').is('archived_at', null).order('created_at', { ascending: false }).limit(300),
  );
  return rows.map(clientDto);
}

export async function getClientDetail(id: string): Promise<ClientDetail> {
  const db = await staffDb();
  const [clientResult, propertiesResult, requestsResult, ordersResult, subscriptionsResult, intentsResult] = await Promise.all([
    db.from('clients').select('*').eq('id', id).is('archived_at', null).maybeSingle(),
    db.from('properties').select('*').eq('client_id', id).is('archived_at', null).order('created_at', { ascending: false }),
    db.from('service_requests')
      .select('*, property:properties(id,address,city,property_type), appointments(*,team:teams(id,name)), quotes(*,quote_items(*))')
      .eq('client_id', id)
      .is('archived_at', null)
      .order('created_at', { ascending: false }),
    db.from('orders')
      .select('*, order_items(*)')
      .eq('client_id', id)
      .is('archived_at', null)
      .order('created_at', { ascending: false }),
    db.from('subscriptions')
      .select('*, plan:subscription_plans(*), subscription_items(*, service:service_catalog(id,code,name_es,name_en))')
      .eq('client_id', id)
      .is('archived_at', null)
      .order('created_at', { ascending: false }),
    db.from('commerce_intents')
      .select('*, product:products(id,name,slug)')
      .eq('client_id', id)
      .order('created_at', { ascending: false }),
  ]);

  const client = clientDto(assertResult<Record<string, unknown>>(
    clientResult as unknown as { data: Record<string, unknown> | null; error: DbError },
    'Cliente no encontrado.',
  ));
  const subscriptions = assertResult<Record<string, unknown>[]>(
    subscriptionsResult as unknown as { data: Record<string, unknown>[] | null; error: DbError },
  ).map(subscriptionDto);

  return {
    client,
    properties: assertResult(propertiesResult),
    requests: assertResult(requestsResult) as ServiceRequest[],
    orders: assertResult(ordersResult),
    subscriptions,
    commerce_intents: assertResult(intentsResult) as CommerceIntent[],
  };
}

export async function listProperties(clientId?: string) {
  const db = await staffDb();
  let query = db.from('properties').select('*, client:clients(id,name)').is('archived_at', null).order('created_at', { ascending: false });
  if (clientId) query = query.eq('client_id', clientId);
  return assertResult(await query.limit(300));
}

export async function createProperty(payload: Record<string, unknown>) {
  const db = await staffDb();
  return assertResult(await db.from('properties').insert({
    client_id: payload.client_id,
    label: payload.label || null,
    address: payload.address,
    city: payload.city,
    region: payload.region || 'FL',
    postal_code: payload.postal_code || null,
    property_type: payload.property_type,
    square_feet: payload.square_feet || null,
    bedrooms: payload.bedrooms ?? null,
    bathrooms: payload.bathrooms ?? null,
    access_notes: payload.access_notes || null,
  }).select().single());
}

export async function listSubscriptionPlans() {
  const db = await staffDb();
  return assertResult(await db.from('subscription_plans').select('*').eq('is_active', true).order('base_price_cents'));
}

export async function listServiceCatalog() {
  const db = await staffDb();
  return assertResult(await db.from('service_catalog').select('*').eq('is_active', true).order('sort_order'));
}

export async function createClient(payload: Partial<Client>) {
  const db = await staffDb();
  const segment = payload.status === 'VIP' ? 'vip' : payload.status === 'Corporate' ? 'corporate' : 'standard';
  const row = assertResult<Record<string, unknown>>(await db.from('clients').insert({
    name: payload.name?.trim(),
    company: payload.company || null,
    email: payload.email?.trim().toLowerCase() || null,
    phone: payload.phone || null,
    billing_address: payload.address || null,
    segment,
    notes: payload.notes || null,
  }).select().single());
  return clientDto(row);
}

export async function updateClient(id: string, payload: Partial<Client>) {
  const db = await staffDb();
  const patch: Record<string, unknown> = {};
  if (payload.name !== undefined) patch.name = payload.name.trim();
  if (payload.company !== undefined) patch.company = payload.company || null;
  if (payload.email !== undefined) patch.email = payload.email?.trim().toLowerCase() || null;
  if (payload.phone !== undefined) patch.phone = payload.phone || null;
  if (payload.address !== undefined) patch.billing_address = payload.address || null;
  if (payload.notes !== undefined) patch.notes = payload.notes || null;
  if (payload.status !== undefined) patch.segment = payload.status === 'VIP' ? 'vip' : payload.status === 'Corporate' ? 'corporate' : 'standard';
  const row = assertResult<Record<string, unknown>>(await db.from('clients').update(patch).eq('id', id).select().single());
  return clientDto(row);
}

export async function archiveClient(id: string) {
  const db = await staffDb();
  assertResult(await db.from('clients').update({ archived_at: new Date().toISOString() }).eq('id', id).select('id').single());
}

export async function listSubscriptions() {
  const db = await staffDb();
  const rows = assertResult<Record<string, unknown>[]>(await db
    .from('subscriptions')
    .select('*, client:clients(*), plan:subscription_plans(*)')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(300));
  return rows.map(subscriptionDto);
}

export async function createSubscription(payload: Partial<Subscription> & Record<string, unknown>) {
  const db = await staffDb();
  const planId = String(payload.tier_id || payload.plan_id || '');
  const propertyId = String(payload.property_id || '');
  const serviceId = String(payload.service_id || '');
  if (!payload.client_id || !planId || !propertyId || !serviceId) {
    throw new Error('Cliente, propiedad, plan y servicio son obligatorios.');
  }
  const status = String(payload.status || 'Pending').toLowerCase();
  const subscriptionId = assertResult<string>(await db.rpc('create_subscription_with_item', {
    p_client_id: payload.client_id,
    p_property_id: propertyId,
    p_plan_id: planId,
    p_service_id: serviceId,
    p_status: status,
    p_monthly_value_cents: cents(payload.mrr),
    p_started_on: payload.started_at ? String(payload.started_at).slice(0, 10) : newYorkDate(new Date()),
    p_next_occurrence_date: payload.next_billing_date || null,
    p_preferred_weekday: payload.preferred_weekday ?? null,
  }));
  const row = assertResult<Record<string, unknown>>(await db.from('subscriptions')
    .select('*, client:clients(*), plan:subscription_plans(*)').eq('id', subscriptionId).single());
  return subscriptionDto(row);
}

export async function updateSubscription(id: string, payload: Partial<Subscription>) {
  const db = await staffDb();
  if (payload.next_billing_date && payload.next_billing_date < newYorkDate(new Date())) {
    throw new Error('La próxima ocurrencia no puede estar en el pasado.');
  }
  if (payload.status === 'Active' && payload.next_billing_date === undefined) {
    const current = assertResult<{ next_occurrence_date: string | null }>(
      await db.from('subscriptions').select('next_occurrence_date').eq('id', id).single(),
    );
    if (!current.next_occurrence_date || String(current.next_occurrence_date) < newYorkDate(new Date())) {
      throw new Error('Define una próxima ocurrencia futura antes de activar la suscripción.');
    }
  }
  const patch: Record<string, unknown> = {};
  if (payload.status) patch.status = payload.status.toLowerCase();
  if (payload.mrr !== undefined) patch.monthly_value_cents = cents(payload.mrr);
  if (payload.next_billing_date !== undefined) patch.next_occurrence_date = payload.next_billing_date;
  if (payload.preferred_weekday !== undefined) patch.preferred_weekday = payload.preferred_weekday;
  if (payload.cancelled_at !== undefined) patch.ended_on = payload.cancelled_at?.slice(0, 10) || null;
  const row = assertResult<Record<string, unknown>>(await db.from('subscriptions').update(patch).eq('id', id)
    .select('*, client:clients(*), plan:subscription_plans(*)').single());
  return subscriptionDto(row);
}

export async function listOffers() {
  const db = await staffDb();
  const rows = assertResult<Record<string, unknown>[]>(await db.from('offers').select('*').order('created_at', { ascending: false }).limit(300));
  return rows.map(offerDto);
}

export async function createOffer(payload: Partial<Offer>) {
  const db = await staffDb();
  const row = assertResult<Record<string, unknown>>(await db.from('offers').insert({
    title: payload.title?.trim(),
    code: payload.code?.trim().toUpperCase(),
    discount_basis_points: payload.discount_type === 'percent' ? Math.round(Number(payload.discount_percent || 0) * 100) : null,
    discount_cents: payload.discount_type === 'fixed_amount' ? cents(payload.discount_amount) : 0,
    max_uses: payload.max_uses,
    is_active: payload.status !== 'Inactive',
    expires_at: payload.expires_at,
    applies_to: payload.applies_to || 'both',
  }).select().single());
  return offerDto(row);
}

export async function updateOffer(id: string, payload: Partial<Offer>) {
  const db = await staffDb();
  const patch: Record<string, unknown> = {};
  if (payload.title !== undefined) patch.title = payload.title;
  if (payload.code !== undefined) patch.code = payload.code.toUpperCase();
  if (payload.status !== undefined) patch.is_active = payload.status === 'Active';
  if (payload.expires_at !== undefined) patch.expires_at = payload.expires_at;
  if (payload.max_uses !== undefined) patch.max_uses = payload.max_uses;
  const row = assertResult<Record<string, unknown>>(await db.from('offers').update(patch).eq('id', id).select().single());
  return offerDto(row);
}

export async function archiveOffer(id: string) {
  const db = await staffDb();
  assertResult(await db.from('offers').update({ is_active: false }).eq('id', id).select('id').single());
}

export async function createProduct(payload: Partial<Product>) {
  const db = await staffDb();
  const product = {
    name: payload.name?.trim(),
    slug: payload.slug?.trim(),
    brand: payload.brand || null,
    tagline: payload.tagline || null,
    description: payload.description || null,
    detailed_description: payload.detailed_description || null,
    price_cents: cents(payload.price),
    compare_at_price_cents: payload.compare_at_price == null ? null : cents(payload.compare_at_price),
    cost_price_cents: payload.cost_price == null ? null : cents(payload.cost_price),
    sale_type: payload.sale_type || 'own_stock',
    affiliate_url: payload.amazon_affiliate_url || null,
    affiliate_asin: payload.amazon_asin || null,
    low_stock_threshold: payload.low_stock_threshold ?? 5,
    category: payload.category || null,
    benefit_label: payload.benefit_label || null,
    accent_gradient: payload.accent_gradient || null,
    specs: payload.specs || [],
    is_active: payload.is_active ?? true,
    is_featured: payload.is_featured ?? false,
    sort_order: payload.sort_order ?? 0,
  };
  const created = assertResult<Record<string, unknown>>(await db.rpc('create_product_with_inventory', {
    p_product: product,
    p_initial_stock: payload.stock_quantity || 0,
  }));
  const row = assertResult<Record<string, unknown>>(await db.from('products')
    .select('*, product_images(*), inventory_levels(on_hand)')
    .eq('id', String(created.id))
    .single());
  return productDto(row, true);
}

export async function updateProduct(id: string, payload: Partial<Product>) {
  const db = await staffDb();
  const patch: Record<string, unknown> = {};
  const direct: Array<keyof Product> = ['name', 'slug', 'brand', 'tagline', 'description', 'detailed_description', 'sale_type', 'low_stock_threshold', 'category', 'benefit_label', 'accent_gradient', 'specs', 'is_active', 'is_featured', 'sort_order'];
  direct.forEach((key) => { if (payload[key] !== undefined) patch[key] = payload[key]; });
  if (payload.price !== undefined) patch.price_cents = cents(payload.price);
  if (payload.compare_at_price !== undefined) patch.compare_at_price_cents = payload.compare_at_price === null ? null : cents(payload.compare_at_price);
  if (payload.cost_price !== undefined) patch.cost_price_cents = payload.cost_price === null ? null : cents(payload.cost_price);
  if (payload.amazon_affiliate_url !== undefined) patch.affiliate_url = payload.amazon_affiliate_url;
  if (payload.amazon_asin !== undefined) patch.affiliate_asin = payload.amazon_asin;
  const row = assertResult<Record<string, unknown>>(await db.from('products').update(patch).eq('id', id)
    .select('*, product_images(*), inventory_levels(on_hand)').single());
  return productDto(row, true);
}

export async function archiveProduct(id: string) {
  const db = await staffDb();
  assertResult(await db.from('products').update({ archived_at: new Date().toISOString(), is_active: false }).eq('id', id).select('id').single());
}

export async function listOrders() {
  const db = await staffDb();
  return assertResult(await db.from('orders')
    .select('*, client:clients(*), order_items(*)')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(300));
}

export async function createOrder(order: Record<string, unknown>, items: Record<string, unknown>[]) {
  const db = await staffDb();
  return assertResult(await db.rpc('create_order_with_items', { p_order: order, p_items: items }));
}

export async function updateOrderStatus(id: string, status: string) {
  const db = await staffDb();
  return assertResult(await db.rpc('transition_order', { p_order_id: id, p_status: status }));
}

export async function dashboard(): Promise<DashboardSummary> {
  const db = await staffDb();
  const businessDate = newYorkDate(new Date());
  const nextBusinessDate = new Date(`${businessDate}T12:00:00Z`);
  nextBusinessDate.setUTCDate(nextBusinessDate.getUTCDate() + 1);
  const start = newYorkLocalToIso(`${businessDate}T00:00`);
  const end = newYorkLocalToIso(`${nextBusinessDate.toISOString().slice(0, 10)}T00:00`);
  const [requests, appointments, subscriptions, inventory, intents, orders, recent] = await Promise.all([
    db.from('service_requests').select('id', { count: 'exact', head: true }).not('status', 'in', '("completed","cancelled")'),
    db.from('appointments').select('id', { count: 'exact', head: true }).gte('starts_at', start).lt('starts_at', end).neq('status', 'cancelled'),
    db.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('inventory_levels').select('on_hand, product:products(low_stock_threshold)'),
    db.from('commerce_intents').select('id', { count: 'exact', head: true }).in('status', ['new', 'contacted']),
    db.from('orders').select('total_cents').in('status', ['confirmed', 'fulfilled']),
    db.from('service_requests').select('*, client:clients(id,name,email,phone), property:properties(id,address,city,property_type)').order('created_at', { ascending: false }).limit(6),
  ]);
  const lowStock = (inventory.data || []).filter((row) => {
    const product = Array.isArray(row.product) ? row.product[0] : row.product;
    return Number(row.on_hand) <= Number((product as { low_stock_threshold?: number } | null)?.low_stock_threshold || 0);
  }).length;
  return {
    open_requests: requests.count || 0,
    today_appointments: appointments.count || 0,
    active_subscriptions: subscriptions.count || 0,
    low_stock_products: lowStock,
    pending_intents: intents.count || 0,
    confirmed_revenue_cents: (orders.data || []).reduce((sum, row) => sum + Number(row.total_cents || 0), 0),
    recent_requests: (recent.data || []) as ServiceRequest[],
  };
}

export async function listServiceRequests(): Promise<ServiceRequest[]> {
  const db = await staffDb();
  return assertResult(await db.from('service_requests')
    .select('*, client:clients(id,name,email,phone), property:properties(id,address,city,property_type), appointments(*), quotes(*)')
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(300)) as ServiceRequest[];
}

export async function transitionServiceRequest(id: string, status: RequestStatus, note?: string) {
  const db = await staffDb();
  return assertResult(await db.rpc('transition_service_request', { p_request_id: id, p_status: status, p_note: note || null }));
}

export async function listTeams(): Promise<Team[]> {
  const db = await staffDb();
  return assertResult(await db.from('teams').select('*, team_members(*, profile:profiles(id,display_name,email,role))').is('archived_at', null).order('name')) as Team[];
}

export async function createTeam(payload: { name: string; capacity_size: number }) {
  const db = await staffDb();
  return assertResult(await db.from('teams').insert(payload).select().single());
}

export async function listShifts() {
  const db = await staffDb();
  return assertResult(await db.from('shifts').select('*, profile:profiles(id,display_name,email)').order('starts_at').limit(300));
}

export async function assignTeamMember(payload: { team_id: string; profile_id: string; starts_on: string }) {
  const db = await staffDb();
  return assertResult(await db.from('team_members').insert(payload).select().single());
}

export async function createShift(payload: { profile_id: string; starts_at: string; ends_at: string; notes?: string }) {
  const db = await staffDb();
  return assertResult(await db.from('shifts').insert(payload).select().single());
}

export async function listAppointments(): Promise<Appointment[]> {
  const db = await staffDb();
  return assertResult(await db.from('appointments')
    .select('*, team:teams(*), property:properties(address,city), service_request:service_requests(*)')
    .order('starts_at')
    .limit(300)) as Appointment[];
}

export async function availableTeams(startsAt: string, endsAt: string, requiredSize: number) {
  const db = await staffDb();
  return assertResult(await db.rpc('available_teams', {
    p_starts_at: startsAt,
    p_ends_at: endsAt,
    p_required_size: requiredSize,
  }));
}

export async function scheduleAppointment(input: {
  requestId: string;
  teamId: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}) {
  const db = await staffDb();
  return assertResult(await db.rpc('schedule_appointment', {
    p_request_id: input.requestId,
    p_team_id: input.teamId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_notes: input.notes || null,
  }));
}

export async function rescheduleAppointment(id: string, input: {
  teamId: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}) {
  const db = await staffDb();
  return assertResult(await db.rpc('reschedule_appointment', {
    p_appointment_id: id,
    p_team_id: input.teamId,
    p_starts_at: input.startsAt,
    p_ends_at: input.endsAt,
    p_notes: input.notes || null,
  }));
}

export function createQuoteToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: createHash('sha256').update(token).digest('hex') };
}

export function hashQuoteToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function createQuote(input: {
  requestId: string;
  items: QuoteItem[];
  discountCents?: number;
  taxBasisPoints?: number;
  notes?: string;
  tokenHash: string;
  approvalUrl: string;
}): Promise<Quote> {
  const db = await staffDb();
  return assertResult(await db.rpc('create_quote_with_items', {
    p_request_id: input.requestId,
    p_items: input.items,
    p_discount_cents: input.discountCents || 0,
    p_tax_basis_points: input.taxBasisPoints || 0,
    p_notes: input.notes || null,
    p_access_token_hash: input.tokenHash,
    p_approval_url: input.approvalUrl,
  })) as Quote;
}

type PublicQuote = {
  id: string;
  quote_number: string;
  status: string;
  currency: string;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  notes: string | null;
  expires_at: string;
  quote_items: Array<Record<string, unknown>>;
  service_request: Record<string, unknown> | Array<Record<string, unknown>>;
};

export async function getPublicQuote(token: string): Promise<PublicQuote> {
  const db = getServiceSupabase();
  const hash = hashQuoteToken(token);
  const result = await db.from('quotes')
    .select('id,quote_number,status,currency,subtotal_cents,discount_cents,tax_cents,total_cents,notes,expires_at,quote_items(description,quantity,unit_price_cents,total_cents),service_request:service_requests(reference_code,service_name_snapshot,contact_name,locale)')
    .eq('access_token_hash', hash)
    .eq('status', 'sent')
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  return assertResult<PublicQuote>(
    result as unknown as { data: PublicQuote | null; error: DbError },
    'La cotización no está disponible.',
  );
}

export async function decideQuote(token: string, decision: 'accepted' | 'declined') {
  return assertResult(await getServiceSupabase().rpc('decide_quote', {
    p_access_token_hash: hashQuoteToken(token),
    p_decision: decision,
  }));
}

export async function listInventory(): Promise<InventoryRow[]> {
  const db = await staffDb();
  return assertResult(await db.from('inventory_levels')
    .select('*, product:products(id,name,slug,low_stock_threshold)')
    .order('updated_at', { ascending: false })) as InventoryRow[];
}

export async function adjustInventory(productId: string, delta: number, movementType: string, note: string) {
  const db = await staffDb();
  return assertResult(await db.rpc('adjust_inventory', {
    p_product_id: productId,
    p_quantity_delta: delta,
    p_movement_type: movementType,
    p_note: note,
  }));
}

export async function listCommerceIntents(): Promise<CommerceIntent[]> {
  const db = await staffDb();
  return assertResult(await db.from('commerce_intents')
    .select('*, product:products(id,name,slug)')
    .order('created_at', { ascending: false })
    .limit(300)) as CommerceIntent[];
}

export async function createCommerceIntent(input: Record<string, unknown>) {
  const db = getServiceSupabase();
  const normalizedEmail = typeof input.contact_email === 'string' ? input.contact_email.trim().toLowerCase() : '';
  const product = await db.from('products')
    .select('id,sale_type,inventory_levels(on_hand)')
    .eq('id', String(input.product_id || ''))
    .eq('is_active', true)
    .is('archived_at', null)
    .maybeSingle();
  if (product.error || !product.data) throw new Error(product.error?.message || 'El producto no está disponible.');
  if (input.channel === 'affiliate' && product.data.sale_type !== 'amazon_affiliate') {
    throw new Error('Este producto no admite una intención afiliada.');
  }
  const level = Array.isArray(product.data.inventory_levels)
    ? product.data.inventory_levels[0]
    : product.data.inventory_levels;
  if (product.data.sale_type === 'own_stock' && Number(level?.on_hand || 0) < 1) {
    throw new Error('El producto no está disponible.');
  }
  const existingClient = normalizedEmail
    ? await db.from('clients').select('id').eq('email', normalizedEmail).is('archived_at', null).maybeSingle()
    : { data: null, error: null };
  if (existingClient.error) throw new Error(existingClient.error.message);
  const result = await db.from('commerce_intents').insert({
    ...input,
    contact_email: normalizedEmail || null,
    client_id: existingClient.data?.id || null,
  }).select().single();
  return assertResult<Record<string, unknown>>(
    result as { data: Record<string, unknown> | null; error: DbError },
  );
}

export async function updateCommerceIntent(id: string, patch: {
  status?: string;
  affiliate_reference?: string | null;
  commission_cents?: number | null;
}) {
  const db = await staffDb();
  const includeAffiliate = patch.affiliate_reference !== undefined || patch.commission_cents !== undefined;
  const updated = assertResult<Record<string, unknown>>(await db.rpc('update_commerce_intent', {
    p_intent_id: id,
    p_status: patch.status ?? null,
    p_affiliate_reference: patch.affiliate_reference ?? null,
    p_commission_cents: patch.commission_cents ?? null,
    p_include_affiliate: includeAffiliate,
  }));
  return assertResult(await db.from('commerce_intents')
    .select('*, product:products(id,name,slug)')
    .eq('id', String(updated.id))
    .single());
}

export async function listStaff(): Promise<StaffProfile[]> {
  const db = await staffDb();
  return assertResult(await db.from('profiles').select('*').is('archived_at', null).order('display_name')) as StaffProfile[];
}

export async function updateStaffProfile(id: string, patch: { role?: StaffRole; is_active?: boolean; display_name?: string }) {
  const db = await staffDb();
  return assertResult(await db.rpc('update_staff_profile', {
    p_profile_id: id,
    p_role: patch.role ?? null,
    p_is_active: patch.is_active ?? null,
    p_display_name: patch.display_name ?? null,
  }));
}

export async function listAuditEvents() {
  const db = await staffDb();
  return assertResult(await db.from('audit_events').select('*').order('created_at', { ascending: false }).limit(300));
}

export async function createBooking(input: Record<string, unknown>, attachmentKeys: string[]) {
  return assertResult(await getServiceSupabase().rpc('create_public_service_request', {
    p_input: input,
    p_attachment_keys: attachmentKeys,
  }));
}

export async function crewAppointments(profileId: string) {
  const db = await staffDb();
  const teams = assertResult(await db.from('team_members').select('team_id').eq('profile_id', profileId));
  const teamIds = teams.map((row) => String(row.team_id));
  if (!teamIds.length) return [];
  return assertResult(await db.from('appointments')
    .select('*, team:teams(*), property:properties(address,city,access_notes), service_request:service_requests(*)')
    .in('team_id', teamIds)
    .gte('ends_at', new Date(Date.now() - 24 * 60 * 60_000).toISOString())
    .order('starts_at')
    .limit(100));
}

export function dbForTests(client: SupabaseClient) {
  return { assertResult, client };
}
