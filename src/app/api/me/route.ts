import { NextResponse } from 'next/server';

import { getClientIdentity } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'me-read', 120, 15 * 60_000);
    if (limited) return limited;
    const identity = await getClientIdentity();
    return NextResponse.json({
      client_id: identity.clientId,
      name: identity.name,
      email: identity.email,
      phone: identity.phone,
      locale: identity.locale,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Only the columns a customer owns; `segment` and lifetime value stay with staff. */
const EDITABLE = ['name', 'company', 'phone', 'billing_address', 'locale'] as const;

export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'me-write', 30, 15 * 60_000);
    if (limited) return limited;
    const identity = await getClientIdentity();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return badRequest('Cuerpo de solicitud inválido.');

    const patch: Record<string, unknown> = {};
    for (const field of EDITABLE) {
      if (field in body) patch[field] = body[field as keyof typeof body];
    }
    if (Object.keys(patch).length === 0) return badRequest('No hay campos permitidos para actualizar.');
    if ('name' in patch && !String(patch.name ?? '').trim()) return badRequest('El nombre es obligatorio.');
    if ('locale' in patch && !['es', 'en'].includes(String(patch.locale))) {
      return badRequest('El idioma no es válido.');
    }

    // RLS re-authorizes this write server-side; the filter is belt and braces.
    const db = await createUserSupabase();
    const { data, error } = await db
      .from('clients')
      .update(patch)
      .eq('id', identity.clientId)
      .select('id, name, company, email, phone, billing_address, locale')
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
