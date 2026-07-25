import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requireStaff } from '@/lib/server/auth';
import { availableTeams } from '@/lib/server/repository';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';

export const runtime = 'nodejs';

const schema = z.object({
  team_size_required: z.number().int().positive(),
  date_start: z.string().datetime(),
  date_end: z.string().datetime(),
}).refine((value) => new Date(value.date_end) > new Date(value.date_start), {
  message: 'El final debe ser posterior al inicio.',
});

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'dispatch', 30, 15 * 60_000);
    if (limited) return limited;
    await requireStaff(['owner', 'manager', 'dispatcher']);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Datos inválidos.');
    const teams = await availableTeams(parsed.data.date_start, parsed.data.date_end, parsed.data.team_size_required);
    return NextResponse.json({ mode: 'live', available_teams: teams });
  } catch (error) {
    return errorResponse(error, 'No fue posible calcular la disponibilidad.');
  }
}
