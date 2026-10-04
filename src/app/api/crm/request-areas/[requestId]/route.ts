import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireStaff } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';
import { linkRequestAreas, listRequestAreas } from '@/lib/server/repository';

export const runtime = 'nodejs';

type Context = { params: Promise<{ requestId: string }> };

/** Areas on the request's property, flagged when the request covers them. */
export async function GET(request: Request, context: Context) {
  try {
    const limited = await rateLimit(request, 'crm-read', 180, 15 * 60_000);
    if (limited) return limited;
    await requireStaff(['owner', 'manager', 'dispatcher']);
    const { requestId } = await context.params;
    return NextResponse.json(await listRequestAreas(requestId), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Replaces the covered set. Completing the request resets these to 100%. */
export async function PUT(request: Request, context: Context) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'crm-write', 60, 15 * 60_000);
    if (limited) return limited;
    await requireStaff(['owner', 'manager', 'dispatcher']);
    const { requestId } = await context.params;
    const parsed = z.object({ areaIds: z.array(z.string().uuid()).max(100) }).safeParse(await request.json().catch(() => null));
    if (!parsed.success) return badRequest('Lista de espacios inválida.');
    const linked = await linkRequestAreas(requestId, parsed.data.areaIds);
    return NextResponse.json({ linked });
  } catch (error) {
    return errorResponse(error);
  }
}
