'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, ClipboardList, CreditCard, LoaderCircle, MessageSquareMore, PackageSearch, WalletCards } from 'lucide-react';

import { db } from '@/lib/db';
import type { DashboardSummary } from '@/lib/types';
import { CrmEmptyState, CrmMetricCard, CrmPageIntro, CrmStatusPill } from '@/components/admin/CrmPrimitives';

const emptySummary: DashboardSummary = {
  open_requests: 0,
  today_appointments: 0,
  active_subscriptions: 0,
  low_stock_products: 0,
  pending_intents: 0,
  confirmed_revenue_cents: 0,
  recent_requests: [],
};

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    db.dashboard.getSummary().then(({ data, error: loadError }) => {
      if (data) setSummary(data);
      if (loadError) setError(loadError.message);
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Solicitudes abiertas', value: summary.open_requests, icon: ClipboardList, href: '/admin/requests' },
    { label: 'Citas de hoy', value: summary.today_appointments, icon: CalendarDays, href: '/admin/calendar' },
    { label: 'Suscripciones activas', value: summary.active_subscriptions, icon: CreditCard, href: '/admin/subscriptions' },
    { label: 'Stock bajo', value: summary.low_stock_products, icon: PackageSearch, href: '/admin/inventory' },
    { label: 'Oportunidades abiertas', value: summary.pending_intents, icon: MessageSquareMore, href: '/admin/intents' },
    { label: 'Órdenes confirmadas', value: money(summary.confirmed_revenue_cents), icon: WalletCards, href: '/admin/orders' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      <CrmPageIntro eyebrow="Control del negocio" title="Resumen operativo" description="Señales accionables de CRM, agenda, comercio e inventario en una sola vista." />
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      {loading ? (
        <div className="grid min-h-64 place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ label, value, icon: Icon, href }) => (
              <CrmMetricCard key={label} label={label} value={value} icon={Icon} href={href} />
            ))}
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white">Solicitudes recientes</h2>
              <Link href="/admin/requests" className="text-sm text-red-300 hover:text-red-200">Ver pipeline</Link>
            </div>
            {summary.recent_requests.length ? (
              <div className="divide-y divide-white/10">
                {summary.recent_requests.map((request) => (
                  <Link href={`/admin/requests?request=${request.id}`} key={request.id} className="grid gap-2 px-5 py-4 transition hover:bg-white/[0.03] sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-medium text-white">{request.contact_name} · {request.service_name_snapshot}</p>
                      <p className="mt-1 font-mono text-xs text-zinc-500">{request.reference_code}</p>
                    </div>
                    <CrmStatusPill tone={request.status === 'cancelled' ? 'danger' : request.status === 'completed' ? 'success' : request.status === 'quoted' ? 'info' : 'warning'}>{request.status}</CrmStatusPill>
                  </Link>
                ))}
              </div>
            ) : <CrmEmptyState icon={ClipboardList} title="Todavía no hay solicitudes" detail="Las nuevas solicitudes y sus próximos pasos aparecerán aquí." />}
          </section>
        </>
      )}
    </div>
  );
}
