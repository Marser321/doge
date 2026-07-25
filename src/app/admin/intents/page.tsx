'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ExternalLink, LoaderCircle, MessageCircleMore } from 'lucide-react';

import { db } from '@/lib/db';
import { apiRequest } from '@/lib/api-client';
import type { CommerceIntent, CurrentStaffUser, IntentStatus } from '@/lib/types';

const statuses: IntentStatus[] = ['new', 'contacted', 'converted', 'lost'];

export default function IntentsPage() {
  const [items, setItems] = useState<CommerceIntent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canEditAffiliate, setCanEditAffiliate] = useState(false);

  async function load() {
    const result = await db.intents.getAll();
    if (result.data) setItems(result.data);
    setError(result.error?.message || '');
    setLoading(false);
  }
  useEffect(() => {
    load();
    apiRequest<CurrentStaffUser>('/api/auth/me', { auth: 'required' })
      .then((staff) => setCanEditAffiliate(['owner', 'manager'].includes(staff.role)))
      .catch(() => undefined);
  }, []);

  async function change(id: string, status: IntentStatus) {
    const result = await db.intents.update(id, { status });
    if (result.error) setError(result.error.message);
    else await load();
  }

  async function saveAffiliate(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const commission = String(form.get('commission') || '').trim();
    const result = await db.intents.update(id, {
      affiliate_reference: String(form.get('reference') || '').trim() || null,
      commission_cents: commission ? Math.round(Number(commission) * 100) : null,
    });
    if (result.error) setError(result.error.message);
    else await load();
  }

  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-20">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Comercio asistido</p><h1 className="mt-2 text-3xl font-semibold text-white">Oportunidades</h1><p className="mt-2 text-sm text-zinc-400">Intenciones registradas desde WhatsApp y enlaces afiliados.</p></div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        {items.length ? <div className="divide-y divide-white/10">{items.map((intent) => (
          <article key={intent.id} className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_150px_180px] md:items-center">
            <div>
              <p className="font-medium text-white">{intent.product?.name || 'Producto'}</p>
              <p className="mt-1 text-xs text-zinc-500">{intent.contact_name || intent.contact_email || 'Visita anónima'} · {new Intl.DateTimeFormat('es-US', { dateStyle: 'medium' }).format(new Date(intent.created_at))}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300">{intent.channel === 'whatsapp' ? <MessageCircleMore className="size-3" /> : <ExternalLink className="size-3" />}{intent.channel}</span>
            <select aria-label={`Estado de ${intent.product?.name}`} value={intent.status} onChange={(event) => change(intent.id, event.target.value as IntentStatus)} className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white">
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            {intent.channel === 'affiliate' && (
              <form onSubmit={(event) => saveAffiliate(event, intent.id)} className="grid gap-2 md:col-span-3 md:grid-cols-[1fr_160px_auto]">
                <input name="reference" defaultValue={intent.affiliate_reference || ''} disabled={!canEditAffiliate} placeholder="Referencia externa" className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm disabled:opacity-60" />
                <input name="commission" defaultValue={intent.commission_cents == null ? '' : (intent.commission_cents / 100).toFixed(2)} disabled={!canEditAffiliate} type="number" min="0" step="0.01" placeholder="Comisión USD" className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm disabled:opacity-60" />
                {canEditAffiliate && <button className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Guardar afiliado</button>}
              </form>
            )}
          </article>
        ))}</div> : <div className="py-20 text-center text-sm text-zinc-500"><MessageCircleMore className="mx-auto mb-3 size-8" />Todavía no hay oportunidades registradas.</div>}
      </section>
    </div>
  );
}
