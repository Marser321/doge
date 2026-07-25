import { NextResponse } from 'next/server';

import { dispatchEmailOutbox } from '@/lib/server/email';
import { errorResponse } from '@/lib/server/http';

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  const authorization = request.headers.get('authorization');
  if (!expected || authorization !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  try {
    return NextResponse.json({ results: await dispatchEmailOutbox(20) });
  } catch (error) {
    return errorResponse(error);
  }
}

export const GET = POST;
