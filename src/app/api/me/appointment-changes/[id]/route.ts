import { NextResponse } from 'next/server';

import { getClientIdentity } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

/** Withdraws a pending change. The row is kept with status `withdrawn`. */
export async function PATCH(request: Request, { params }: Params) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'me-write', 30, 15 * 60_000);
    if (limited) return limited;
    await getClientIdentity();
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (body?.status !== 'withdrawn') return badRequest('Solo podés retirar una solicitud pendiente.');

    const db = await createUserSupabase();
    const { data, error } = await db.rpc('withdraw_appointment_change', { p_change_id: id });
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
