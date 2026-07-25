'use client';

import { createBrowserClient } from '@supabase/ssr';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function publicConfiguration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) {
    throw new Error('Supabase no está configurado. Revisa las variables públicas del proyecto.');
  }
  return { url, publishableKey };
}

export function getBrowserSupabase() {
  if (!browserClient) {
    const { url, publishableKey } = publicConfiguration();
    browserClient = createBrowserClient(url, publishableKey);
  }
  return browserClient;
}
