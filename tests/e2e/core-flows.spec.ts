import { expect, test } from '@playwright/test';

test('public booking request produces a reference after API confirmation', async ({ page }) => {
  await page.route('**/api/bookings', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'DOGE-TEST-001' }) });
  });
  await page.goto('/booking');
  await page.getByLabel('Nombre completo').fill('Ada Lovelace');
  await page.getByLabel('Teléfono').fill('+1 305 555 0101');
  await page.getByLabel('Email').fill('ada@example.com');
  await page.getByLabel('Dirección').fill('1 Ocean Drive');
  await page.getByLabel('Ciudad').fill('Miami');
  await page.getByLabel('Tipo de propiedad').selectOption({ label: 'Residencial' });
  await page.getByLabel('Servicio').selectOption({ label: 'Limpieza profunda' });
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Enviar solicitud' }).click();
  await expect(page).toHaveURL(/booking\/success\?reference=DOGE-TEST-001/);
  await expect(page.getByText('DOGE-TEST-001')).toBeVisible();
});

test('membership interest is persisted as a real service request', async ({ page }) => {
  await page.route('**/api/bookings', async (route) => {
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ reference: 'DOGE-MEMBER-001' }) });
  });
  await page.goto('/membership');
  await page.getByLabel('Nombre completo').fill('Ada Membership');
  await page.getByLabel('Email').fill('member@example.com');
  await page.getByLabel('Teléfono').fill('+1 305 555 0102');
  await page.getByLabel('Dirección').fill('2 Ocean Drive');
  await page.getByLabel('Ciudad').fill('Miami Beach');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Solicitar Membresía' }).click();
  await expect(page.getByText('DOGE-MEMBER-001')).toBeVisible();
});

test('unauthenticated visitors are redirected away from admin and CRM rejects them', async ({ page, request }) => {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const response = await request.get('/api/crm/clients');
    expect(response.status()).toBe(401);
  }
  await page.goto('/admin');
  await expect(page).toHaveURL((url) => url.pathname === '/login' && url.searchParams.get('next') === '/admin');
});

test('mobile catalogue and service navigation stay reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation').last()).toBeVisible();
  await page.locator('a[href="/booking"]').first().click();
  await expect(page).toHaveURL(/\/booking/);
});

test('service catalogue uses local visual posters', async ({ page }) => {
  await page.goto('/services');
  await expect(page.getByRole('heading', { name: /servicios/i }).first()).toBeVisible();

  const posterSources = await page.locator('img').evaluateAll((images) =>
    images.map((image) => image.getAttribute('src') || ''),
  );

  expect(posterSources).toHaveLength(4);
  expect(posterSources.every((src) => src.includes('services'))).toBe(true);
  expect(posterSources.some((src) => src.includes('unsplash'))).toBe(false);
});
