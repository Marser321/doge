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
      .from('service_requests')
      .select('id, reference_code, service_name_snapshot, status, preferred_date, created_at, property:properties(id, label, address, city)')
      .eq('client_id', identity.clientId)
      .is('archived_at', null)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (error) {
    return errorResponse(error);
  }
}
