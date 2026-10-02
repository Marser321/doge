import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/server/http';
import { getServiceSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

/** Membership plans are public catalogue data, read before any sign-in. */
export async function GET() {
  try {
    const { data, error } = await getServiceSupabase()
      .from('subscription_plans')
      .select('id, name, description, cadence_days, base_price_cents')
      .eq('is_active', true)
      .order('cadence_days', { ascending: false });
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (error) {
    if (error instanceof Error && /supabase no está configurado/i.test(error.message)) {
      return NextResponse.json([]);
    }
    return errorResponse(error);
  }
}
