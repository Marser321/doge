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

    // Link the auth user to its client record. A plain insert used to fail
    // silently against `clients_active_email_unique` whenever the email already
    // had anonymous bookings, leaving the auth user with no client row at all.
    //
    // That index is partial (`where archived_at is null`), which PostgREST
    // cannot name as an ON CONFLICT target, so the match is done explicitly:
    // an existing record is adopted, otherwise a new one is created.
    const { data: existing, error: lookupError } = await serviceSupabase
      .from('clients')
      .select('id, auth_user_id, phone')
      .eq('email', email)
      .is('archived_at', null)
      .maybeSingle();
    if (lookupError) throw new Error(`No fue posible verificar tu ficha de cliente: ${lookupError.message}`);

    const linkError = existing
      ? (existing.auth_user_id && existing.auth_user_id !== userData.user.id
        // Someone else already owns this client record: never reassign it.
        ? { message: 'Esta ficha de cliente ya está vinculada a otra cuenta.' }
        : (await serviceSupabase
          .from('clients')
          .update({ auth_user_id: userData.user.id, name, phone: phone || existing.phone })
          .eq('id', existing.id)).error)
      : (await serviceSupabase
        .from('clients')
        .insert({ name, email, phone: phone || null, locale: 'es', auth_user_id: userData.user.id })).error;

    if (linkError) {
      // Without a client row the account cannot reach its own panel, so this is
      // fatal: roll the auth user back rather than leave it orphaned.
      await serviceSupabase.auth.admin.deleteUser(userData.user.id).catch(() => {});
      throw new Error(`No fue posible vincular la cuenta con tu ficha de cliente: ${linkError.message}`);
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
