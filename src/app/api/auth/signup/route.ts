import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/server/supabase';
import { errorResponse, badRequest, rateLimit } from '@/lib/server/http';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    try {
      const limited = await rateLimit(request, 'auth-signup', 10, 15 * 60_000);
      if (limited) return limited;
    } catch {
      // Allow signup to proceed if rate limit table/pepper is unavailable in dev
    }

    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();

    if (!email || !email.includes('@')) {
      return badRequest('Ingresa un correo electrónico válido.');
    }
    if (!password || password.length < 8) {
      return badRequest('La contraseña debe tener al menos 8 caracteres.');
    }
    if (!name) {
      return badRequest('Ingresa tu nombre completo.');
    }

    const serviceSupabase = getServiceSupabase();

    // Create user via admin API
    const { data: userData, error: createError } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: name,
        phone: phone || null,
      },
    });

    if (createError) {
      if (/already.*registered|unique/i.test(createError.message)) {
        return NextResponse.json(
          { error: 'Este correo electrónico ya está registrado. Inicia sesión.' },
          { status: 409 },
        );
      }
      return badRequest(createError.message);
    }

    // Link to public.clients table for record keeping
    try {
      await serviceSupabase.from('clients').insert({
        name,
        email,
        phone: phone || null,
        segment: 'standard',
        locale: 'es',
      });
    } catch (clientErr) {
      console.warn('[Signup] Could not create client row:', clientErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada con éxito.',
      user: {
        id: userData.user.id,
        email: userData.user.email,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
