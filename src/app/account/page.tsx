import { redirect } from 'next/navigation';

/** Customer self-service is not part of CRM v1; prevent a misleading demo UI. */
export default function AccountPage() {
  redirect('/login');
}
