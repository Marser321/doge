import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { expect, test, type Page } from '@playwright/test';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const configured = Boolean(supabaseUrl && secretKey);
const runId = `${Date.now()}-${process.pid}`;
const customerEmail = `customer-${runId}@test.doge`;
const dispatcherEmail = `dispatch-guide-${runId}@test.doge`;
const password = 'Doge-Test-2026!';
const appOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3100').origin;
const mutationHeaders = () => ({ 'Idempotency-Key': crypto.randomUUID(), Origin: appOrigin });

let admin: SupabaseClient;
let customerId = '';
let dispatcherId = '';
let requestId = '';

function nyDate(offsetDays: number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(Date.now() + offsetDays * 86_400_000));
}

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
}

test.describe('@backend customer guide and change requests', () => {
  // Login plus first compile of /admin or /account can exceed the 30 s default.
  test.describe.configure({ mode: 'serial', timeout: 90_000 });
  test.skip(!configured, 'Requires a running Supabase project.');

  test.beforeAll(async () => {
    admin = createClient(supabaseUrl!, secretKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    const customer = await admin.auth.admin.createUser({ email: customerEmail, password, email_confirm: true });
    const dispatcher = await admin.auth.admin.createUser({ email: dispatcherEmail, password, email_confirm: true });
    if (customer.error || dispatcher.error) throw new Error(customer.error?.message || dispatcher.error?.message);
    customerId = customer.data.user!.id;
    dispatcherId = dispatcher.data.user!.id;
    const profile = await admin.from('profiles').upsert({
      id: dispatcherId, email: dispatcherEmail, display_name: 'Dispatch Guide', role: 'dispatcher', is_active: true,
    });
    if (profile.error) throw new Error(profile.error.message);

    const client = await admin.from('clients').insert({ name: 'Cliente Guía', email: customerEmail, auth_user_id: customerId })
      .select('id').single();
    if (client.error) throw new Error(client.error.message);
    const property = await admin.from('properties').insert({
      client_id: client.data.id, address: '10 Guide Ave', city: 'Miami', property_type: 'Residencial',
    }).select('id').single();
    if (property.error) throw new Error(property.error.message);
    const area = await admin.from('property_areas').insert({
      property_id: property.data.id, area_type_code: 'kitchen', label: 'Cocina E2E',
      last_cleaned_at: new Date(Date.now() - 18 * 86_400_000).toISOString(),
    });
    if (area.error) throw new Error(area.error.message);
    const service = await admin.from('service_catalog').select('id, name_es').eq('code', 'window-cleaning').single();
    if (service.error) throw new Error(service.error.message);
    const request = await admin.from('service_requests').insert({
      reference_code: `E2E-${runId}`, client_id: client.data.id, property_id: property.data.id,
      service_id: service.data.id, service_name_snapshot: service.data.name_es, contact_name: 'Cliente Guía',
      contact_email: customerEmail, status: 'approved', preferred_date: nyDate(5),
    }).select('id').single();
    if (request.error) throw new Error(request.error.message);
    requestId = request.data.id;
  });

  test.afterAll(async () => {
    if (customerId) await admin.auth.admin.deleteUser(customerId);
    if (dispatcherId) await admin.auth.admin.deleteUser(dispatcherId);
  });

  test('a new customer is welcomed with the guided tour and can turn the guide off', async ({ page }) => {
    await login(page, customerEmail);
    await expect(page).toHaveURL(/\/account/, { timeout: 30_000 });

    // The panel waits for its account data and the guide before greeting.
    await expect(page.getByRole('heading', { name: 'Te damos la bienvenida a tu panel' })).toBeVisible({ timeout: 20_000 });
    await page.getByRole('button', { name: 'Empezar recorrido' }).click();
    await expect(page.getByText(/Paso 1 de \d/)).toBeVisible();
    await page.keyboard.press('Escape');

    await expect.poll(async () => (await (await page.request.get('/api/me/guide')).json()).progress.tour).toBeTruthy();

    // The due kitchen is flagged on the home summary.
    await expect(page.getByText('Cocina E2E')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Primeros pasos' })).toBeVisible();

    await page.getByRole('button', { name: 'Ayuda' }).click();
    await page.getByText('Guía interactiva').click();
    await expect(page.getByRole('switch')).not.toBeChecked();
    await expect(page.getByRole('heading', { name: 'Primeros pasos' })).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Primeros pasos' })).toHaveCount(0);
  });

  test('a customer requests a change once and dispatch resolves it', async ({ page, browser }) => {
    await login(page, customerEmail);
    await expect(page).toHaveURL(/\/account/, { timeout: 30_000 });

    const body = { request_id: requestId, kind: 'schedule', preferred_date: nyDate(7), preferred_window: 'morning' };
    const first = await page.request.post('/api/me/appointment-changes', { headers: mutationHeaders(), data: body });
    expect(first.status()).toBe(201);
    const second = await page.request.post('/api/me/appointment-changes', { headers: mutationHeaders(), data: body });
    expect(second.status()).toBe(409);

    const dispatch = await browser.newPage();
    await login(dispatch, dispatcherEmail);
    await expect(dispatch).toHaveURL(/\/admin/, { timeout: 30_000 });
    const inbox = await dispatch.request.get('/api/crm/appointment-changes');
    const pending = (await inbox.json()).find((change: { service_request: { id: string } | null; status: string }) =>
      change.service_request?.id === requestId && change.status === 'pending');
    expect(pending).toBeTruthy();
    const resolved = await dispatch.request.post(`/api/crm/appointment-changes/${pending.id}`, {
      headers: mutationHeaders(),
      data: { decision: 'approved', note: 'Confirmamos por la mañana' },
    });
    expect(resolved.status()).toBe(200);
    await dispatch.close();

    const requests = await page.request.get('/api/me/requests');
    const mine = (await requests.json()).find((request: { id: string }) => request.id === requestId);
    expect(mine.changes[0].status).toBe('approved');
  });
});
