import { redirect } from 'next/navigation';

import AdminShell from '@/components/admin/AdminShell';
import { getStaffIdentity } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let identity;
  try {
    identity = await getStaffIdentity();
  } catch {
    redirect('/login?next=/admin');
  }

  if (identity.role === 'crew') redirect('/dashboard/crew');
  if (identity.needsMfa) redirect('/login/mfa?next=/admin');

  return (
    <AdminShell initialUser={{
      id: identity.id,
      email: identity.email,
      role: identity.role,
      display_name: identity.displayName,
      locale: identity.locale,
      aal: identity.aal,
      needs_mfa: identity.needsMfa,
    }}>
      {children}
    </AdminShell>
  );
}
