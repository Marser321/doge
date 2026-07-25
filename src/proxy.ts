import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return response;

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const isProtected = request.nextUrl.pathname.startsWith('/admin')
    || request.nextUrl.pathname.startsWith('/dashboard/crew');

  if (isProtected && !user) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(login);
  }
  if (isProtected && user) {
    const { data: profile } = await supabase.from('profiles')
      .select('role,is_active')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile?.is_active) {
      const login = request.nextUrl.clone();
      login.pathname = '/login';
      login.search = '';
      return NextResponse.redirect(login);
    }
    if (request.nextUrl.pathname.startsWith('/admin') && profile.role === 'crew') {
      const crew = request.nextUrl.clone();
      crew.pathname = '/dashboard/crew';
      crew.search = '';
      return NextResponse.redirect(crew);
    }
    if (request.nextUrl.pathname.startsWith('/dashboard/crew') && profile.role !== 'crew') {
      const admin = request.nextUrl.clone();
      admin.pathname = '/admin';
      admin.search = '';
      return NextResponse.redirect(admin);
    }
    const managementOnly = [
      '/admin/audit',
      '/admin/offers',
      '/admin/products',
      '/admin/settings',
      '/admin/staff',
      '/admin/subscriptions',
    ];
    if (profile.role === 'dispatcher' && managementOnly.some((path) => request.nextUrl.pathname.startsWith(path))) {
      const admin = request.nextUrl.clone();
      admin.pathname = '/admin';
      admin.search = '';
      return NextResponse.redirect(admin);
    }
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
