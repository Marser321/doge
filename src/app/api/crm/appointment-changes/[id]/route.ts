import { z } from 'zod';

import { requireStaff } from '@/lib/server/auth';
import { dispatchEmailOutbox } from '@/lib/server/email';
import { badRequest, errorResponse, rateLimit, requireSameOrigin, runIdempotentJson } from '@/lib/server/http';
import { resolveAppointmentChange } from '@/lib/server/repository';

export const runtime = 'nodejs';

const schema = z.object({
  decision: z.enum(['approved', 'declined']),
  note: z.string().trim().max(1000).optional(),
  teamId: z.string().uuid().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
}).refine((value) => value.decision !== 'declined' || Boolean(value.note), {
  message: 'Indicá el motivo del rechazo.',
}).refine((value) => {
  const slot = [value.teamId, value.startsAt, value.endsAt].filter(Boolean).length;
  if (slot === 0) return true;
  return slot === 3 && new Date(value.endsAt!) > new Date(value.startsAt!);
}, { message: 'Elegí equipo, inicio y fin válidos para agendar.' });

/** Approves (optionally booking the slot in the same transaction) or declines. */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'crm-write', 60, 15 * 60_000);
    if (limited) return limited;
    const identity = await requireStaff(['owner', 'manager', 'dispatcher']);
    const { id } = await context.params;
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Decisión inválida.');

    return await runIdempotentJson(
      request,
      'crm:appointment-changes:resolve',
      identity.id,
      JSON.stringify({ id, ...parsed.data }),
      async () => {
        const result = await resolveAppointmentChange(id, parsed.data);
        await dispatchEmailOutbox(2).catch(() => undefined);
        return result;
      },
      200,
    );
  } catch (error) {
    return errorResponse(error);
  }
}
