import 'server-only';

import { getServiceSupabase } from './lib/server/supabase';

export async function testDatabaseConnection() {
  const { data, error } = await getServiceSupabase().from('service_catalog').select('id').limit(1);
  if (error) throw new Error(error.message);
  return { connected: true, rows: data?.length || 0 };
}
