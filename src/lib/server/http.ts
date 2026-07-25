import 'server-only';

import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from './supabase';

export function errorResponse(error: unknown, fallback = 'No fue posible completar la operación.') {
  const message = error instanceof Error ? error.message : fallback;
  const status = /supabase no está configurado|falta supabase/i.test(message)
    ? 503
    : /MFA_REQUIRED/.test(message)
      ? 403
      : /permiso|rol no autorizado/i.test(message)
        ? 403
        : /no autorizado|sesión/i.test(message)
          ? 401
          : /no encontrad|cotización no está disponible/i.test(message)
            ? 404
            : /stock insuficiente|transición .*no válida|no admite|ya no está disponible|no se puede reprogramar|conflict|exclusion|duplicate key|unique constraint/i.test(message)
              ? 409
              : 500;
  const expected = /^(MFA_REQUIRED|No autorizado|No tienes permiso|.*(?:no encontrad|no está disponible|no admite|inválid|requiere|insuficiente|no tiene capacidad|no tiene suficientes|no se puede|no pertenece|no pudo registrar su idempotencia))/i.test(message);
  if (!expected) console.error('[DOGE API]', error);
  const publicMessage = message === 'MFA_REQUIRED'
    ? 'Se requiere verificación MFA.'
    : expected
      ? message
      : fallback;
  return NextResponse.json(
    { error: publicMessage, code: message === 'MFA_REQUIRED' ? message : undefined },
    { status },
  );
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function rateLimit(request: Request, bucket: string, limit: number, windowMs: number) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const identity = forwarded || request.headers.get('x-real-ip') || 'anonymous';
  const pepper = process.env.RATE_LIMIT_PEPPER || process.env.SUPABASE_SECRET_KEY;
  if (!pepper) throw new Error('El rate limiting distribuido no está configurado.');
  const identityHash = createHash('sha256').update(`${pepper}:${identity}`).digest('hex');
  const { data, error } = await getServiceSupabase().rpc('consume_rate_limit', {
    p_bucket: bucket,
    p_identity_hash: identityHash,
    p_limit: limit,
    p_window_seconds: Math.ceil(windowMs / 1000),
  });
  if (error) throw new Error(`No fue posible validar el límite de solicitudes: ${error.message}`);
  return data === true ? null : NextResponse.json(
    { error: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.' },
    { status: 429, headers: { 'Retry-After': String(Math.ceil(windowMs / 1000)) } },
  );
}

export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) throw new Error('No autorizado: falta el origen de la solicitud.');
  const requestOrigin = new URL(request.url).origin;
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (origin !== requestOrigin && origin !== allowedOrigin) {
    throw new Error('No autorizado: origen de solicitud inválido.');
  }
}

type IdempotencyRow = {
  request_hash: string;
  response_status: number | null;
  response_body: unknown;
  created_at: string;
};

export async function runIdempotentJson<T>(
  request: Request,
  scope: string,
  actorSubject: string,
  fingerprint: string,
  operation: () => Promise<T>,
  status = 200,
) {
  const key = request.headers.get('idempotency-key')?.trim();
  if (!key || !/^[A-Za-z0-9._:-]{8,200}$/.test(key)) {
    return badRequest('Se requiere una clave de idempotencia válida.');
  }

  const keyHash = createHash('sha256').update(`${scope}:${actorSubject}:${key}`).digest('hex');
  const requestHash = createHash('sha256').update(fingerprint).digest('hex');
  const db = getServiceSupabase();
  const insert = () => db.from('api_idempotency_keys').insert({
    key_hash: keyHash,
    scope,
    actor_subject: actorSubject,
    request_hash: requestHash,
  });

  let reservation = await insert();
  if (reservation.error?.code === '23505') {
    const existingResult = await db.from('api_idempotency_keys')
      .select('request_hash,response_status,response_body,created_at')
      .eq('key_hash', keyHash)
      .single();
    if (existingResult.error || !existingResult.data) throw new Error(existingResult.error?.message || 'No fue posible recuperar la operación.');
    const existing = existingResult.data as IdempotencyRow;
    if (existing.request_hash !== requestHash) {
      return NextResponse.json({ error: 'La clave de idempotencia ya fue usada con otros datos.' }, { status: 409 });
    }
    if (existing.response_status !== null) {
      return NextResponse.json(existing.response_body, {
        status: existing.response_status,
        headers: { 'Idempotency-Replayed': 'true' },
      });
    }
    const stale = new Date(existing.created_at).getTime() < Date.now() - 15 * 60_000;
    if (!stale) {
      return NextResponse.json({ error: 'La operación con esta clave todavía está en proceso.' }, {
        status: 409,
        headers: { 'Retry-After': '5' },
      });
    }
    await db.from('api_idempotency_keys').delete().eq('key_hash', keyHash).is('response_status', null);
    reservation = await insert();
  }
  if (reservation.error) throw new Error(`No fue posible reservar la operación: ${reservation.error.message}`);

  let operationFinished = false;
  try {
    const data = await operation();
    operationFinished = true;
    const body = data ?? { ok: true };
    const completion = await db.from('api_idempotency_keys').update({
      response_status: status,
      response_body: body,
    }).eq('key_hash', keyHash);
    if (completion.error) throw new Error(`La operación terminó, pero no pudo registrar su idempotencia: ${completion.error.message}`);
    return NextResponse.json(body, { status });
  } catch (error) {
    if (!operationFinished) {
      await db.from('api_idempotency_keys').delete().eq('key_hash', keyHash).is('response_status', null);
    }
    throw error;
  }
}
