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
  // Staff areas demand a profile row; /account only demands a session, because
  // customers deliberately have no row in `profiles` (that table is staff-only).
  const isStaffArea = request.nextUrl.pathname.startsWith('/admin')
    || request.nextUrl.pathname.startsWith('/dashboard/crew');
  const isAccountArea = request.nextUrl.pathname.startsWith('/account');
  const isProtected = isStaffArea || isAccountArea;

  if (isProtected && !user) {
    const login = request.nextUrl.clone();
    login.pathname = '/login';
    login.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(login);
  }
  if (isAccountArea && user) {
    // A signed-in customer belongs here; staff get sent to their own console so
    // the two surfaces never blur into one another.
    const { data: staffProfile } = await supabase.from('profiles')
      .select('role,is_active')
      .eq('id', user.id)
      .maybeSingle();
    if (staffProfile?.is_active) {
      const staffHome = request.nextUrl.clone();
      staffHome.pathname = staffProfile.role === 'crew' ? '/dashboard/crew' : '/admin';
      staffHome.search = '';
      return NextResponse.redirect(staffHome);
    }
    return response;
  }
  if (isStaffArea && user) {
    const { data: profile } = await supabase.from('profiles')
      .select('role,is_active')
      .eq('id', user.id)
      .maybeSingle();
    if (!profile?.is_active) {
      // A signed-in customer is not staff: send them to their own panel rather
      // than back to a login form they have already passed.
      const fallback = request.nextUrl.clone();
      fallback.pathname = '/account';
      fallback.search = '';
      return NextResponse.redirect(fallback);
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
