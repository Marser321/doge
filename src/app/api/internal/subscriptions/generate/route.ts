import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/server/http';
import { getServiceSupabase } from '@/lib/server/supabase';

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  try {
    const db = getServiceSupabase();
    const { data, error } = await db.rpc('generate_subscription_requests', { p_horizon_days: 30 });
    if (error) throw new Error(error.message);

    // The cleanliness sweep rides this job rather than taking a cron slot of its
    // own: Vercel Hobby caps scheduled jobs, and a third schedule makes the
    // deployment fail outright. Queueing is idempotent via email_outbox.event_key,
    // so a retry of this route never double-sends.
    const { data: reminders, error: sweepError } = await db.rpc('sweep_area_reminders');
    if (sweepError) throw new Error(sweepError.message);

    await Promise.all([
      db.from('quotes').update({ status: 'expired', access_token_hash: null }).eq('status', 'sent').lt('expires_at', new Date().toISOString()),
      db.from('rate_limit_windows').delete().lt('expires_at', new Date().toISOString()),
    ]);
    return NextResponse.json({ generated: data || 0, reminders: reminders || 0 });
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = POST;
