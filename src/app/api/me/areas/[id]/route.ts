import { NextResponse } from 'next/server';

import { getClientIdentity } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'me-write', 30, 15 * 60_000);
    if (limited) return limited;
    await getClientIdentity();
    const { id } = await params;

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return badRequest('Cuerpo de solicitud inválido.');

    const patch: Record<string, unknown> = {};
    if ('label' in body) {
      const label = String(body.label ?? '').trim();
      if (!label) return badRequest('El nombre del espacio es obligatorio.');
      patch.label = label;
    }
    if ('requirements' in body) patch.requirements = String(body.requirements ?? '').trim() || null;
    if ('measurement_value' in body) {
      const raw = body.measurement_value;
      if (raw === null || raw === '') {
        patch.measurement_value = null;
      } else {
        const value = Number(raw);
        if (!Number.isFinite(value) || value <= 0) return badRequest('La medida debe ser un número mayor a cero.');
        patch.measurement_value = value;
      }
    }
    if (Object.keys(patch).length === 0) return badRequest('No hay campos permitidos para actualizar.');

    // RLS scopes the update to areas on the caller's own properties.
    const db = await createUserSupabase();
    const { data, error } = await db
      .from('property_areas')
      .update(patch)
      .eq('id', id)
      .is('archived_at', null)
      .select('id, label, measurement_value, requirements, last_cleaned_at')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('El espacio no fue encontrado.');
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}

/** Areas are archived, never hard-deleted: they carry service history. */
export async function DELETE(request: Request, { params }: Params) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'me-write', 30, 15 * 60_000);
    if (limited) return limited;
    await getClientIdentity();
    const { id } = await params;

    const db = await createUserSupabase();
    const { data, error } = await db
      .from('property_areas')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .is('archived_at', null)
      .select('id')
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('El espacio no fue encontrado.');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
