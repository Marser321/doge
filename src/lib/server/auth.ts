import 'server-only';

import type { StaffRole } from '@/lib/types';
import { createUserSupabase } from './supabase';

export type StaffIdentity = {
  id: string;
  email: string | null;
  role: StaffRole;
  displayName: string | null;
  locale: 'es' | 'en';
  aal: 'aal1' | 'aal2';
  needsMfa: boolean;
};

export async function getStaffIdentity(): Promise<StaffIdentity> {
  const client = await createUserSupabase();
  const { data: current, error: userError } = await client.auth.getUser();
  if (userError || !current.user) throw new Error('No autorizado: la sesión no es válida.');

  const { data, error } = await client
    .from('profiles')
    .select('id, role, display_name, locale, is_active')
    .eq('id', current.user.id)
    .maybeSingle();

  const profile = data as {
    id: string;
    role: StaffRole;
    display_name: string | null;
    locale: 'es' | 'en';
    is_active: boolean;
  } | null;
  if (error || !profile?.is_active) throw new Error('No autorizado: el perfil no está habilitado.');
  const { data: assurance } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  const aal = assurance?.currentLevel === 'aal2' ? 'aal2' : 'aal1';
  const enforceMfa = process.env.ENFORCE_MFA === 'true';
  const needsMfa = enforceMfa && ['owner', 'manager'].includes(profile.role) && aal !== 'aal2';

  return {
    id: current.user.id,
    email: typeof current.user.email === 'string' ? current.user.email : null,
    role: profile.role,
    displayName: profile.display_name,
    locale: profile.locale,
    aal,
    needsMfa,
  };
}

export type ClientIdentity = {
  userId: string;
  clientId: string;
  email: string | null;
  name: string;
  phone: string | null;
  locale: 'es' | 'en';
};

/**
 * Resolves the signed-in customer behind the request.
 *
 * This is the customer-side twin of `getStaffIdentity`: a customer has no row
 * in `profiles` (that table is staff-only), they are matched through
 * `clients.auth_user_id`. Throwing here yields a 401 via `errorResponse`.
 */
export async function getClientIdentity(): Promise<ClientIdentity> {
  const client = await createUserSupabase();
  const { data: current, error: userError } = await client.auth.getUser();
  if (userError || !current.user) throw new Error('No autorizado: la sesión no es válida.');

  const { data, error } = await client
    .from('clients')
    .select('id, name, email, phone, locale')
    .eq('auth_user_id', current.user.id)
    .is('archived_at', null)
    .maybeSingle();

  const row = data as {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    locale: 'es' | 'en';
  } | null;
  if (error || !row) throw new Error('No autorizado: la cuenta no tiene una ficha de cliente.');

  return {
    userId: current.user.id,
    clientId: row.id,
    email: row.email ?? (typeof current.user.email === 'string' ? current.user.email : null),
    name: row.name,
    phone: row.phone,
    locale: row.locale,
  };
}

export async function requireStaff(
  permitted: StaffRole[] = ['owner', 'manager', 'dispatcher'],
  options: { requireMfa?: boolean } = {},
) {
  const identity = await getStaffIdentity();
  if (!permitted.includes(identity.role)) throw new Error('No tienes permiso para realizar esta acción.');
  if ((options.requireMfa ?? ['owner', 'manager'].includes(identity.role)) && identity.needsMfa) {
    throw new Error('MFA_REQUIRED');
  }
  return identity;
}
