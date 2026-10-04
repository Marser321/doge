import { NextResponse } from 'next/server';
import { z } from 'zod';

import { GUIDE_FLAGS, sanitizeProgress } from '@/lib/guide';
import { getClientIdentity } from '@/lib/server/auth';
import { badRequest, errorResponse, rateLimit, requireSameOrigin } from '@/lib/server/http';
import { createUserSupabase } from '@/lib/server/supabase';

export const runtime = 'nodejs';

type PreferencesRow = { guide_enabled: boolean; guide_progress: unknown } | null;

async function readPreferences(clientId: string) {
  const db = await createUserSupabase();
  const { data, error } = await db
    .from('client_preferences')
    .select('guide_enabled, guide_progress')
    .eq('client_id', clientId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  const row = data as PreferencesRow;
  return {
    db,
    enabled: row?.guide_enabled ?? true,
    progress: sanitizeProgress(row?.guide_progress),
  };
}

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'me-read', 120, 15 * 60_000);
    if (limited) return limited;
    const identity = await getClientIdentity();
    const { enabled, progress } = await readPreferences(identity.clientId);
    return NextResponse.json({ enabled, progress });
  } catch (error) {
    return errorResponse(error);
  }
}

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  complete: z.array(z.enum(GUIDE_FLAGS)).max(GUIDE_FLAGS.length).optional(),
  reset: z.literal(true).optional(),
}).refine((value) => value.enabled !== undefined || value.complete?.length || value.reset, {
  message: 'No hay cambios para guardar.',
});

/** Toggles the guide, marks steps complete, or restarts it from scratch. */
export async function PATCH(request: Request) {
  try {
    requireSameOrigin(request);
    const limited = await rateLimit(request, 'me-write', 60, 15 * 60_000);
    if (limited) return limited;
    const identity = await getClientIdentity();

    const parsed = patchSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message || 'Cuerpo de solicitud inválido.');

    const current = await readPreferences(identity.clientId);
    const stamp = new Date().toISOString();
    const progress = parsed.data.reset ? {} : { ...current.progress };
    for (const step of parsed.data.complete ?? []) progress[step] ??= stamp;
    const enabled = parsed.data.reset ? true : parsed.data.enabled ?? current.enabled;

    // RLS limits the upsert to the caller's own row.
    const { error } = await current.db
      .from('client_preferences')
      .upsert({ client_id: identity.clientId, guide_enabled: enabled, guide_progress: progress });
    if (error) throw new Error(error.message);
    return NextResponse.json({ enabled, progress });
  } catch (error) {
    return errorResponse(error);
  }
}
