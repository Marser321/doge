import Link from 'next/link';
import { Database, KeyRound, MailCheck, ScrollText, ShieldCheck } from 'lucide-react';

import { getStaffIdentity } from '@/lib/server/auth';

export default async function AdminSettingsPage() {
  const identity = await getStaffIdentity();
  const checks = [
    { label: 'Base de datos', detail: 'Supabase PostgreSQL con migraciones versionadas', icon: Database },
    { label: 'Autorización', detail: 'RLS y permisos por rol; BFF sin acceso directo desde el navegador', icon: ShieldCheck },
    { label: 'Sesión', detail: identity.aal === 'aal2' ? 'MFA verificado para esta sesión' : 'Sesión AAL1', icon: KeyRound },
    { label: 'Email', detail: 'Outbox transaccional y entregas de Resend auditables', icon: MailCheck },
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-20">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Sistema</p><h1 className="mt-2 text-3xl font-semibold text-white">Configuración y seguridad</h1><p className="mt-2 text-sm text-zinc-400">Estado de las protecciones operativas del proyecto.</p></div>
      <section className="grid gap-4 sm:grid-cols-2">
        {checks.map(({ label, detail, icon: Icon }) => <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><Icon className="size-5 text-red-300" /><h2 className="mt-4 font-semibold text-white">{label}</h2><p className="mt-2 text-sm leading-6 text-zinc-400">{detail}</p></article>)}
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <div className="flex items-start gap-3"><ScrollText className="mt-0.5 size-5 text-zinc-500" /><div><h2 className="font-semibold text-white">Trazabilidad</h2><p className="mt-1 text-sm text-zinc-400">Consulta cambios de estado, inventario, órdenes y acciones sensibles.</p><Link href="/admin/audit" className="mt-4 inline-flex rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:bg-white/5">Abrir auditoría</Link></div></div>
      </section>
    </div>
  );
}
