import { NextResponse } from 'next/server';

import { getClientIdentity } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

/**
 * Creates a pending membership for one of the caller's own properties.
 *
 * The RPC re-checks ownership server-side, so a forged `property_id` cannot
 * attach a subscription to someone else's property.
 */
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'me-write', 30, 15 * 60_000);
    if (limited) return limited;
    await getClientIdentity();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return badRequest('Cuerpo de solicitud inválido.');
    const planId = String(body.plan_id ?? '').trim();
    const propertyId = String(body.property_id ?? '').trim();
    if (!planId || !propertyId) return badRequest('Elegí un plan y una propiedad.');

    const db = await createUserSupabase();
    const { data, error } = await db.rpc('request_membership', {
      p_plan_id: planId,
      p_property_id: propertyId,
      p_service_code: String(body.service_code ?? '').trim() || null,
      p_notes: String(body.notes ?? '').trim() || null,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
