import { NextResponse } from 'next/server';

import { getStaffIdentity } from '@/lib/server/auth';
import { errorResponse, rateLimit } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const limited = await rateLimit(request, 'auth-me', 60, 15 * 60_000);
    if (limited) return limited;
    const user = await getStaffIdentity();
    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
      display_name: user.displayName,
      locale: user.locale,
      aal: user.aal,
      needs_mfa: user.needsMfa,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
