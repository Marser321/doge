import { NextResponse } from 'next/server';

import { requireStaff } from '@/lib/server/auth';
import { errorResponse, rateLimit } from '@/lib/server/http';
import { crewAppointments } from '@/lib/server/repository';

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'crew-read', 120, 15 * 60_000);
    if (limited) return limited;
    const staff = await requireStaff(['crew'], { requireMfa: false });
    return NextResponse.json(await crewAppointments(staff.id), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
