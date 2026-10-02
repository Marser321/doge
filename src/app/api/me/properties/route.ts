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
    const db = await createUserSupabase();
    const { data, error } = await db
      .from('properties')
      .select('id, label, address, city, region, postal_code, property_type, square_feet, access_notes, created_at')
      .eq('client_id', identity.clientId)
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
    const address = String(body.address ?? '').trim();
    const city = String(body.city ?? '').trim();
    const propertyType = String(body.property_type ?? '').trim();
    if (!address || !city || !propertyType) {
      return badRequest('Dirección, ciudad y tipo de propiedad son obligatorios.');
    }

    const db = await createUserSupabase();
    const { data, error } = await db
      .from('properties')
      .insert({
        client_id: identity.clientId,
        label: String(body.label ?? '').trim() || null,
        address,
        city,
        property_type: propertyType,
        access_notes: String(body.access_notes ?? '').trim() || null,
      })
      .select('id, label, address, city, property_type, access_notes, created_at')
      .single();
    if (error) throw new Error(error.message);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
