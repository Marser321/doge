import { NextResponse } from 'next/server';

import { requireStaff } from '@/lib/server/auth';
import { errorResponse, rateLimit } from '@/lib/server/http';
import { listAppointmentChanges } from '@/lib/server/repository';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'crm-read', 180, 15 * 60_000);
    if (limited) return limited;
    await requireStaff(['owner', 'manager', 'dispatcher']);
    const data = await listAppointmentChanges();
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
