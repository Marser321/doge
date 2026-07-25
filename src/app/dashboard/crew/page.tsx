import { redirect } from 'next/navigation';

import CrewDashboard from '@/components/crew/CrewDashboard';
import { getStaffIdentity } from '@/lib/server/auth';
import { crewAppointments } from '@/lib/server/repository';

export const dynamic = 'force-dynamic';

export default async function CrewPage() {
  let staff;
  try {
    staff = await getStaffIdentity();
  } catch {
    redirect('/login?next=/dashboard/crew');
  }
  if (staff.role !== 'crew') redirect('/admin');
  const appointments = await crewAppointments(staff.id);
  return <CrewDashboard initialAppointments={appointments} displayName={staff.displayName || staff.email || 'Cuadrilla'} />;
}
