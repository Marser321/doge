import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

import { safeInternalPath } from '@/lib/domain';
import { createUserSupabase } from '@/lib/server/supabase';

const allowedTypes = new Set<EmailOtpType>([
  'email',
  'email_change',
  'invite',
  'magiclink',
  'recovery',
  'signup',
]);

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const rawType = request.nextUrl.searchParams.get('type') as EmailOtpType | null;
  const next = safeInternalPath(request.nextUrl.searchParams.get('next'), '/login/setup');

  if (tokenHash && rawType && allowedTypes.has(rawType)) {
    const supabase = await createUserSupabase();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: rawType });
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(new URL('/login?error=invalid-link', request.url));
}
