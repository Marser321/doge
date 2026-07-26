import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { expect, test } from '@playwright/test';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const configured = Boolean(supabaseUrl && secretKey);
const runId = `${Date.now()}-${process.pid}`;
const dispatcherEmail = `dispatcher-${runId}@test.doge`;
const managerEmail = `manager-${runId}@test.doge`;
const password = 'Doge-Test-2026!';
const appOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100').origin;
const mutationHeaders = (key = crypto.randomUUID()) => ({ 'Idempotency-Key': key, Origin: appOrigin });

let admin: SupabaseClient;
let dispatcherId = '';
let managerId = '';
let teamId = '';
let productId = '';

test.describe('@backend Supabase operational flows', () => {
  test.describe.configure({ mode: 'serial' });
  test.skip(!configured, 'Requires a running Supabase project.');

  test.beforeAll(async () => {
    admin = createClient(supabaseUrl!, secretKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const dispatcher = await admin.auth.admin.createUser({
      email: dispatcherEmail,
      password,
      email_confirm: true,
      user_metadata: { display_name: 'Dispatcher E2E' },
    });
    const manager = await admin.auth.admin.createUser({
      email: managerEmail,
      password,
      email_confirm: true,
      user_metadata: { display_name: 'Manager E2E' },
    });
    if (dispatcher.error || !dispatcher.data.user || manager.error || !manager.data.user) {
      throw new Error(dispatcher.error?.message || manager.error?.message || 'Could not create E2E users.');
    }
    dispatcherId = dispatcher.data.user.id;
    managerId = manager.data.user.id;
    const profiles = await admin.from('profiles').upsert([
      { id: dispatcherId, email: dispatcherEmail, display_name: 'Dispatcher E2E', role: 'dispatcher', is_active: true },
      { id: managerId, email: managerEmail, display_name: 'Manager E2E', role: 'manager', is_active: true },
    ]);
    if (profiles.error) throw new Error(profiles.error.message);

    const team = await admin.from('teams').insert({ name: `Equipo E2E ${runId}`, capacity_size: 1 }).select('id').single();
    if (team.error || !team.data) throw new Error(team.error?.message || 'Could not create team.');
    teamId = team.data.id;
    const membership = await admin.from('team_members').insert({
      team_id: teamId,
      profile_id: dispatcherId,
      starts_on: new Date(Date.now() - 86_400_000).toISOString().slice(0, 10),
    });
    const shift = await admin.from('shifts').insert({
      profile_id: dispatcherId,
      starts_at: new Date(Date.now() - 3_600_000).toISOString(),
      ends_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    });
    if (membership.error || shift.error) throw new Error(membership.error?.message || shift.error?.message);

    const product = await admin.from('products').insert({
      name: `Producto E2E ${runId}`,
      slug: `producto-e2e-${runId}`,
      price_cents: 2500,
      sale_type: 'own_stock',
      is_active: true,
    }).select('id').single();
    if (product.error || !product.data) throw new Error(product.error?.message || 'Could not create product.');
    productId = product.data.id;
    const stock = await admin.from('inventory_levels').insert({ product_id: productId, on_hand: 2 });
    if (stock.error) throw new Error(stock.error.message);
  });

  test.afterAll(async () => {
    if (dispatcherId) await admin.auth.admin.deleteUser(dispatcherId);
    if (managerId) await admin.auth.admin.deleteUser(managerId);
  });

  test('manager login is held at MFA enrollment', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(managerEmail);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/login\/mfa\?next=/);
    await expect(page.getByRole('heading', { name: 'Verificación en dos pasos' })).toBeVisible();
  });

  test('booking, quote decision and dispatch overlap are enforced end-to-end', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(dispatcherEmail);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Ingresar' }).click();
    await expect(page).toHaveURL(/\/admin/);

    const bookingKey = crypto.randomUUID();
    const booking = await page.request.post('/api/bookings', {
      headers: mutationHeaders(bookingKey),
      multipart: {
        name: 'Ada E2E',
        email: `ada-${runId}@example.com`,
        phone: '+1 305 555 0101',
        address: '1 Ocean Drive',
        city: 'Miami',
        property_type: 'Residencial',
        service_code: 'window-cleaning',
        locale: 'es',
        consent: 'accepted',
        photos: {
          name: 'property.png',
          mimeType: 'image/png',
          buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nZ0AAAAASUVORK5CYII=', 'base64'),
        },
      },
    });
    expect(booking.status()).toBe(201);
    const bookingBody = await booking.json();
    expect(bookingBody.reference).toMatch(/^DOGE-/);

    const replay = await page.request.post('/api/bookings', {
      headers: mutationHeaders(bookingKey),
      multipart: {
        name: 'Ada E2E',
        email: `ada-${runId}@example.com`,
        phone: '+1 305 555 0101',
        address: '1 Ocean Drive',
        city: 'Miami',
        property_type: 'Residencial',
        service_code: 'window-cleaning',
        locale: 'es',
        consent: 'accepted',
        photos: {
          name: 'property.png',
          mimeType: 'image/png',
          buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nZ0AAAAASUVORK5CYII=', 'base64'),
        },
      },
    });
    expect(replay.headers()['idempotency-replayed']).toBe('true');
    expect((await replay.json()).requestId).toBe(bookingBody.requestId);

    const transition = await page.request.patch(`/api/crm/service-requests/${bookingBody.requestId}`, {
      headers: mutationHeaders(),
      data: { status: 'reviewing' },
    });
    expect(transition.ok()).toBe(true);

    const quote = await page.request.post('/api/crm/service-requests', {
      headers: mutationHeaders(),
      data: {
        action: 'quote',
        requestId: bookingBody.requestId,
        items: [{ description: 'Servicio E2E', quantity: 1, unit_price_cents: 12500 }],
        discountCents: 500,
        taxBasisPoints: 700,
      },
    });
    expect(quote.status()).toBe(201);
    const quoteBody = await quote.json();
    const quoteUrl = new URL(quoteBody.approval_url);
    const token = quoteUrl.pathname.split('/').pop()!;
    const decision = await page.request.post(`/api/quotes/${token}`, {
      headers: mutationHeaders(),
      data: { decision: 'accepted' },
    });
    expect(decision.ok()).toBe(true);

    const original = await admin.from('service_requests').select('*').eq('id', bookingBody.requestId).single();
    if (original.error || !original.data) throw new Error(original.error?.message || 'Request missing.');
    const second = await admin.from('service_requests').insert({
      reference_code: `DOGE-OVERLAP-${runId}`,
      client_id: original.data.client_id,
      property_id: original.data.property_id,
      service_id: original.data.service_id,
      service_name_snapshot: original.data.service_name_snapshot,
      contact_name: original.data.contact_name,
      contact_email: original.data.contact_email,
      contact_phone: original.data.contact_phone,
      locale: original.data.locale,
      source: 'admin',
      status: 'approved',
    }).select('id').single();
    if (second.error || !second.data) throw new Error(second.error?.message || 'Second request missing.');
    const startsAt = new Date(Date.now() + 2 * 86_400_000);
    startsAt.setUTCHours(15, 0, 0, 0);
    const endsAt = new Date(startsAt.getTime() + 2 * 3_600_000);
    const appointment = await page.request.post('/api/crm/appointments', {
      headers: mutationHeaders(),
      data: { requestId: bookingBody.requestId, teamId, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() },
    });
    expect(appointment.status()).toBe(201);
    const overlap = await page.request.post('/api/crm/appointments', {
      headers: mutationHeaders(),
      data: {
        requestId: second.data.id,
        teamId,
        startsAt: new Date(startsAt.getTime() + 30 * 60_000).toISOString(),
        endsAt: new Date(endsAt.getTime() + 30 * 60_000).toISOString(),
      },
    });
    expect(overlap.ok()).toBe(false);
  });

  test('confirmed orders reject insufficient stock and cancellation restores it', async ({ page }) => {
    const catalog = await page.request.get('/api/catalog/products');
    expect(catalog.ok()).toBe(true);
    const publicProduct = (await catalog.json()).find((product: { id: string }) => product.id === productId);
    expect(publicProduct).toBeTruthy();
    expect(publicProduct).not.toHaveProperty('cost_price');
    expect(publicProduct).not.toHaveProperty('amazon_asin');
    expect(publicProduct).not.toHaveProperty('stock_quantity');
    expect(publicProduct).not.toHaveProperty('low_stock_threshold');

    await page.goto('/login');
    await page.getByLabel('Email').fill(dispatcherEmail);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    const orderKey = crypto.randomUUID();
    const order = await page.request.post('/api/crm/orders', {
      headers: mutationHeaders(orderKey),
      data: {
        order: { customer_name: 'Comprador E2E', channel: 'concierge', status: 'confirmed', payment_status: 'unpaid' },
        items: [{ product_id: productId, quantity: 2 }],
      },
    });
    expect(order.status()).toBe(201);
    const orderBody = await order.json();
    const replay = await page.request.post('/api/crm/orders', {
      headers: mutationHeaders(orderKey),
      data: {
        order: { customer_name: 'Comprador E2E', channel: 'concierge', status: 'confirmed', payment_status: 'unpaid' },
        items: [{ product_id: productId, quantity: 2 }],
      },
    });
    expect(replay.headers()['idempotency-replayed']).toBe('true');
    expect((await replay.json()).id).toBe(orderBody.id);

    const insufficient = await page.request.post('/api/crm/orders', {
      headers: mutationHeaders(),
      data: {
        order: { customer_name: 'Sin stock', status: 'confirmed' },
        items: [{ product_id: productId, quantity: 1 }],
      },
    });
    expect(insufficient.ok()).toBe(false);

    const cancelled = await page.request.patch(`/api/crm/orders/${orderBody.id}`, {
      headers: mutationHeaders(),
      data: { status: 'cancelled' },
    });
    expect(cancelled.ok()).toBe(true);
    const stock = await admin.from('inventory_levels').select('on_hand').eq('product_id', productId).single();
    expect(stock.data?.on_hand).toBe(2);
  });

  test('dispatcher is denied management writes and recurring generation is idempotent', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(dispatcherEmail);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Ingresar' }).click();

    const forbidden = await page.request.post('/api/crm/products', {
      headers: mutationHeaders(),
      data: {
        name: 'Producto prohibido',
        slug: `forbidden-${runId}`,
        price: 10,
        sale_type: 'own_stock',
      },
    });
    expect(forbidden.status()).toBe(403);

    test.skip(!process.env.CRON_SECRET, 'Requires CRON_SECRET.');
    const [service, plan] = await Promise.all([
      admin.from('service_catalog').select('id').eq('code', 'window-cleaning').single(),
      admin.from('subscription_plans').select('id,cadence_days').eq('name', 'Essential').single(),
    ]);
    if (service.error || !service.data || plan.error || !plan.data) {
      throw new Error(service.error?.message || plan.error?.message || 'Recurring fixtures are missing.');
    }
    const client = await admin.from('clients').insert({
      name: 'Cliente recurrente E2E',
      email: `recurring-${runId}@example.com`,
    }).select('id').single();
    if (client.error || !client.data) throw new Error(client.error?.message || 'Could not create recurring client.');
    const property = await admin.from('properties').insert({
      client_id: client.data.id,
      address: '30 Recurring Way',
      city: 'Miami',
      property_type: 'Residencial',
    }).select('id').single();
    if (property.error || !property.data) throw new Error(property.error?.message || 'Could not create recurring property.');
    const nextOccurrence = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    const subscription = await admin.from('subscriptions').insert({
      client_id: client.data.id,
      property_id: property.data.id,
      plan_id: plan.data.id,
      status: 'active',
      cadence_days: 30,
      next_occurrence_date: nextOccurrence,
      started_on: new Date().toISOString().slice(0, 10),
      monthly_value_cents: 28000,
    }).select('id').single();
    if (subscription.error || !subscription.data) throw new Error(subscription.error?.message || 'Could not create subscription.');
    const item = await admin.from('subscription_items').insert({
      subscription_id: subscription.data.id,
      service_id: service.data.id,
      quantity: 1,
      unit_price_cents: 28000,
    });
    if (item.error) throw new Error(item.error.message);

    const cronHeaders = { Authorization: `Bearer ${process.env.CRON_SECRET}` };
    const first = await page.request.post('/api/internal/subscriptions/generate', { headers: cronHeaders });
    const second = await page.request.post('/api/internal/subscriptions/generate', { headers: cronHeaders });
    expect(first.ok()).toBe(true);
    expect(second.ok()).toBe(true);
    const generated = await admin.from('service_requests')
      .select('id', { count: 'exact', head: true })
      .eq('subscription_id', subscription.data.id)
      .eq('occurrence_date', nextOccurrence);
    expect(generated.count).toBe(1);
  });
});
