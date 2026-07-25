import { NextResponse } from 'next/server';
import { z } from 'zod';

import { badRequest, errorResponse, rateLimit, runIdempotentJson } from '@/lib/server/http';
import { decideQuote, getPublicQuote } from '@/lib/server/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer' };

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const limited = await rateLimit(request, 'quote-read', 30, 15 * 60_000);
    if (limited) return limited;
    const { token } = await context.params;
    return NextResponse.json(await getPublicQuote(token), { headers: noStore });
  } catch (error) {
    return errorResponse(error, 'La cotización no está disponible.');
  }
}

export async function POST(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const limited = await rateLimit(request, 'quote-decision', 6, 15 * 60_000);
    if (limited) return limited;
    const parsed = z.object({ decision: z.enum(['accepted', 'declined']) }).safeParse(await request.json());
    if (!parsed.success) return badRequest('Decisión inválida.');
    const { token } = await context.params;
    const response = await runIdempotentJson(
      request,
      'public-quote:decision',
      token,
      JSON.stringify(parsed.data),
      () => decideQuote(token, parsed.data.decision),
    );
    Object.entries(noStore).forEach(([name, value]) => response.headers.set(name, value));
    return response;
  } catch (error) {
    return errorResponse(error, 'No fue posible registrar la decisión.');
  }
}
