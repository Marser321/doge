import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/server/http';
import { getServiceSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

/** The area catalogue is DOGE-owned reference data, identical for every account. */
export async function GET() {
  try {
    const { data, error } = await getServiceSupabase()
      .from('area_types')
      .select('code, name_es, name_en, decay_days, measurement_kind, consumable_categories, service_code')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (error) {
    // A preview without backend variables should render an empty picker, not a 500.
    if (error instanceof Error && /supabase no está configurado/i.test(error.message)) {
      return NextResponse.json([]);
    }
    return errorResponse(error);
  }
}
