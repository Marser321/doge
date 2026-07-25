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
    await Promise.all([
      db.from('quotes').update({ status: 'expired', access_token_hash: null }).eq('status', 'sent').lt('expires_at', new Date().toISOString()),
      db.from('rate_limit_windows').delete().lt('expires_at', new Date().toISOString()),
    ]);
    return NextResponse.json({ generated: data || 0 });
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = POST;
