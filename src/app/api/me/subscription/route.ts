import { NextResponse } from 'next/server';

import { getClientIdentity } from '@/lib/server/auth';
import { errorResponse, rateLimit } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'me-read', 120, 15 * 60_000);
    if (limited) return limited;
    const identity = await getClientIdentity();
    const db = await createUserSupabase();
    const { data, error } = await db
      .from('subscriptions')
      .select('id, status, cadence_days, next_occurrence_date, started_on, monthly_value_cents, plan:subscription_plans(id, name, description, cadence_days, base_price_cents)')
      .eq('client_id', identity.clientId)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
