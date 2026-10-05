import { NextResponse } from 'next/server';

import { getClientIdentity } from '@/lib/server/auth';
import { errorResponse, rateLimit } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

// Appointments, covered areas and change requests ride along so the panel can
// render the whole cleaning timeline from one call. RLS scopes every embed.
const REQUEST_SELECT = 'id, reference_code, service_name_snapshot, status, preferred_date, created_at,'
  + ' property:properties(id, label, address, city),'
  + ' appointments(id, starts_at, ends_at, status),'
  + ' areas:service_request_areas(property_area_id),'
  + ' changes:appointment_change_requests(id, kind, status, preferred_date, preferred_window, reason, resolution_note, created_at, resolved_at)';

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'me-read', 120, 15 * 60_000);
    if (limited) return limited;
    const identity = await getClientIdentity();
    const db = await createUserSupabase();
    const { data, error } = await db
      .from('service_requests')
      .select(REQUEST_SELECT)
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
