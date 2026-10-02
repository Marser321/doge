'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle, ScrollText } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';

type AuditEvent = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_email: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export default function AuditPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    apiRequest<AuditEvent[]>('/api/crm/audit', { auth: 'required' })
      .then(setEvents)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'No fue posible cargar la auditoría.'))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle data-motion="progress" className="size-6 animate-spin text-muted" /></div>;
  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-20">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-tone-danger">Seguridad</p><h1 className="mt-2 text-3xl font-semibold text-primary">Auditoría</h1><p className="mt-2 text-sm text-secondary">Eventos inmutables de las operaciones sensibles.</p></div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-subtle bg-surface-1">
        {events.length ? <div className="divide-y divide-subtle">{events.map((event) => (
          <article key={event.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto]">
            <div><p className="font-medium text-primary">{event.action}</p><p className="mt-1 font-mono text-xs text-muted">{event.entity_type} · {event.entity_id || '—'} · {event.actor_email || 'sistema'}</p></div>
            <time className="text-xs text-muted">{new Intl.DateTimeFormat('es-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.created_at))}</time>
          </article>
        ))}</div> : <div className="py-20 text-center text-sm text-muted"><ScrollText className="mx-auto mb-3 size-8" />Todavía no hay eventos.</div>}
      </section>
    </div>
  );
}
