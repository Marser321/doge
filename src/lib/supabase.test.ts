import { afterEach, describe, expect, test, vi } from 'vitest';

describe('Supabase browser configuration', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  afterEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  });

  test('fails closed when public credentials are missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const { getBrowserSupabase } = await import('./supabase/client');
    expect(() => getBrowserSupabase()).toThrow(/Supabase no está configurado/);
  });
});
