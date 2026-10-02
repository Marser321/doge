import { NextResponse } from 'next/server';

import { getClientIdentity } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

const AREA_SELECT =
  'id, property_id, area_type_code, label, measurement_value, requirements, last_cleaned_at, created_at,'
  + ' area_type:area_types(code, name_es, name_en, decay_days, measurement_kind, consumable_categories, service_code)';

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'me-read', 120, 15 * 60_000);
    if (limited) return limited;
    await getClientIdentity();

    // RLS scopes this to the caller's own properties.
    const db = await createUserSupabase();
    const { data, error } = await db
      .from('property_areas')
      .select(AREA_SELECT)
      .is('archived_at', null)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return NextResponse.json(data ?? []);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'me-write', 30, 15 * 60_000);
    if (limited) return limited;
    const identity = await getClientIdentity();

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return badRequest('Cuerpo de solicitud inválido.');
    const propertyId = String(body.property_id ?? '').trim();
    const areaTypeCode = String(body.area_type_code ?? '').trim();
    const label = String(body.label ?? '').trim();
    if (!propertyId || !areaTypeCode || !label) {
      return badRequest('La propiedad, el tipo de espacio y el nombre son obligatorios.');
    }

    const measurementRaw = body.measurement_value;
    let measurement: number | null = null;
    if (measurementRaw !== undefined && measurementRaw !== null && measurementRaw !== '') {
      measurement = Number(measurementRaw);
      if (!Number.isFinite(measurement) || measurement <= 0) {
        return badRequest('La medida debe ser un número mayor a cero.');
      }
    }

    const db = await createUserSupabase();
    // Confirm the property belongs to the caller before writing; RLS enforces
    // the same rule, this turns a policy rejection into a clear message.
    const { data: property, error: propertyError } = await db
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('client_id', identity.clientId)
      .is('archived_at', null)
      .maybeSingle();
    if (propertyError) throw new Error(propertyError.message);
    if (!property) return badRequest('La propiedad no pertenece a tu cuenta.');

    const { data, error } = await db
      .from('property_areas')
      .insert({
        property_id: propertyId,
        area_type_code: areaTypeCode,
        label,
        measurement_value: measurement,
        requirements: String(body.requirements ?? '').trim() || null,
      })
      .select(AREA_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
