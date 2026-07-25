import { NextResponse } from 'next/server';

import { safeInternalPath } from '@/lib/domain';
import { createUserSupabase } from '@/lib/server/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next');
  if (code) {
    const supabase = await createUserSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const destination = safeInternalPath(next, '/admin');
      return NextResponse.redirect(new URL(destination, url.origin));
    }
  }
  return NextResponse.redirect(new URL('/login?error=callback', url.origin));
}
