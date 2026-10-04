import { NextResponse } from 'next/server';
import { z } from 'zod';

import { CHANGE_WINDOWS, validateChangeInput } from '@/lib/appointment-change';
import { getClientIdentity } from '@/lib/server/auth';
import { dispatchEmailOutbox } from '@/lib/server/email';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

const schema = z.object({
  request_id: z.string().uuid(),
  kind: z.enum(['schedule', 'reschedule', 'cancel']),
  preferred_date: z.string().max(10).nullish(),
  preferred_window: z.enum(CHANGE_WINDOWS).nullish(),
  reason: z.string().max(1000).nullish(),
});

/**
 * A customer asks to schedule, move or cancel a visit. Nothing is booked
 * here: dispatch confirms it from the admin panel. The RPC re-checks
 * ownership, the 24-hour notice and the one-pending-change rule.
 */
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'me-write', 30, 15 * 60_000);
    if (limited) return limited;
    await getClientIdentity();

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return badRequest('Revisá los datos del cambio.');
    const input = parsed.data;
    const invalid = validateChangeInput({
      kind: input.kind,
      preferredDate: input.preferred_date,
      preferredWindow: input.preferred_window,
      reason: input.reason,
    });
    if (invalid) return badRequest(invalid);

    const db = await createUserSupabase();
    const { data, error } = await db.rpc('request_appointment_change', {
      p_request_id: input.request_id,
      p_kind: input.kind,
      p_preferred_date: input.kind === 'cancel' ? null : input.preferred_date,
      p_preferred_window: input.kind === 'cancel' ? null : input.preferred_window ?? 'flexible',
      p_reason: input.reason?.trim() || null,
    });
    if (error) throw new Error(error.message);
    await dispatchEmailOutbox(1).catch(() => undefined);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
