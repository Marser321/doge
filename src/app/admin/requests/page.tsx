'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarPlus, CheckCircle2, ClipboardList, LoaderCircle, Plus, Send, X } from 'lucide-react';

import { db } from '@/lib/db';
import type { QuoteItem, RequestStatus, ServiceRequest } from '@/lib/types';

const columns: Array<{ status: RequestStatus; label: string }> = [
  { status: 'new', label: 'Nuevas' },
  { status: 'reviewing', label: 'En revisión' },
  { status: 'quoted', label: 'Cotizadas' },
  { status: 'approved', label: 'Aprobadas' },
  { status: 'scheduled', label: 'Programadas' },
  { status: 'in_progress', label: 'En curso' },
  { status: 'completed', label: 'Completadas' },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-US', { dateStyle: 'medium', timeZone: 'America/New_York' }).format(new Date(value));
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [items, setItems] = useState<Array<QuoteItem & { key: string }>>([
    { key: 'initial-line', description: 'Servicio profesional DOGE', quantity: 1, unit_price_cents: 0 },
  ]);

  async function load() {
    const result = await db.requests.getAll();
    if (result.data) {
      setRequests(result.data);
      setSelected((current) => result.data?.find((item) => item.id === current?.id) || result.data?.[0] || null);
    }
    if (result.error) setError(result.error.message);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => Object.fromEntries(columns.map((column) => [
    column.status,
    requests.filter((request) => request.status === column.status),
  ])) as Record<RequestStatus, ServiceRequest[]>, [requests]);

  async function transition(status: RequestStatus, note?: string) {
    if (!selected) return;
    setBusy(true);
    setError('');
    const result = await db.requests.transition(selected.id, status, note);
    if (result.error) setError(result.error.message);
    await load();
    setBusy(false);
  }

  async function cancel() {
    const reason = window.prompt('Indica el motivo de cancelación:');
    if (reason?.trim()) await transition('cancelled', reason.trim());
  }

  async function submitQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const result = await db.requests.quote({
      requestId: selected.id,
      items: items.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        service_id: item.service_id,
        unit_price_cents: item.unit_price_cents,
        sort_order: index,
      })),
      discountCents: Math.round(Number(form.get('discount') || 0) * 100),
      taxBasisPoints: Math.round(Number(form.get('tax') || 0) * 100),
      notes: String(form.get('notes') || ''),
    });
    if (result.error) setError(result.error.message);
    else {
      setQuoteOpen(false);
      if (result.data?.approval_url) await navigator.clipboard?.writeText(result.data.approval_url).catch(() => undefined);
    }
    await load();
    setBusy(false);
  }

  const nextAction = selected?.status === 'new'
    ? { label: 'Iniciar revisión', status: 'reviewing' as RequestStatus }
    : selected?.status === 'in_progress'
      ? { label: 'Marcar completada', status: 'completed' as RequestStatus }
      : null;

  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div>;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6 pb-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Servicios</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Pipeline de solicitudes</h1>
        <p className="mt-2 text-sm text-zinc-400">Evaluación, cotización, aprobación y ejecución en un solo historial.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
        <section className="overflow-x-auto pb-3">
          <div className="grid min-w-[1120px] grid-cols-7 gap-3">
            {columns.map((column) => (
              <div key={column.status} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{column.label}</h2>
                  <span className="font-mono text-xs text-zinc-600">{grouped[column.status]?.length || 0}</span>
                </div>
                <div className="mt-3 space-y-2">
                  {(grouped[column.status] || []).map((request) => (
                    <button key={request.id} onClick={() => setSelected(request)} className={`w-full rounded-xl border p-3 text-left transition ${selected?.id === request.id ? 'border-red-400/40 bg-red-500/10' : 'border-white/10 bg-black/20 hover:border-white/20'}`}>
                      <p className="line-clamp-2 text-sm font-medium text-white">{request.contact_name}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{request.service_name_snapshot}</p>
                      <p className="mt-3 font-mono text-[10px] text-zinc-600">{request.reference_code}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-5 xl:sticky xl:top-24">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-red-300">{selected.reference_code}</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">{selected.contact_name}</h2>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">{selected.status}</span>
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <div><dt className="text-xs uppercase tracking-wide text-zinc-600">Servicio</dt><dd className="mt-1 text-zinc-200">{selected.service_name_snapshot}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-zinc-600">Contacto</dt><dd className="mt-1 text-zinc-200">{selected.contact_email}<br />{selected.contact_phone}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-zinc-600">Propiedad</dt><dd className="mt-1 text-zinc-200">{selected.property?.address}<br />{selected.property?.city}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-zinc-600">Recibida</dt><dd className="mt-1 text-zinc-200">{formatDate(selected.created_at)}</dd></div>
                {selected.preferred_date && <div><dt className="text-xs uppercase tracking-wide text-zinc-600">Preferencia</dt><dd className="mt-1 text-zinc-200">{selected.preferred_date}</dd></div>}
                {selected.notes && <div><dt className="text-xs uppercase tracking-wide text-zinc-600">Notas</dt><dd className="mt-1 whitespace-pre-wrap text-zinc-300">{selected.notes}</dd></div>}
              </dl>
              <div className="mt-6 grid gap-2">
                {nextAction && <button disabled={busy} onClick={() => transition(nextAction.status)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"><CheckCircle2 className="size-4" /> {nextAction.label}</button>}
                {selected.status === 'reviewing' && <button disabled={busy} onClick={() => setQuoteOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-600"><Send className="size-4" /> Crear y enviar cotización</button>}
                {selected.status === 'approved' && <a href={`/admin/calendar?request=${selected.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-600"><CalendarPlus className="size-4" /> Programar visita</a>}
                {!['completed', 'cancelled'].includes(selected.status) && <button disabled={busy} onClick={cancel} className="min-h-10 rounded-xl border border-red-400/20 px-4 text-sm text-red-300 transition hover:bg-red-500/10">Cancelar solicitud</button>}
              </div>
            </>
          ) : <div className="py-16 text-center text-sm text-zinc-500"><ClipboardList className="mx-auto mb-3 size-7" />Selecciona una solicitud.</div>}
        </aside>
      </div>

      {quoteOpen && selected && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <form onSubmit={submitQuote} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div><p className="text-xs uppercase tracking-wide text-red-300">Cotización</p><h2 className="mt-1 text-xl font-semibold">Conceptos y precios</h2></div>
              <button type="button" onClick={() => setQuoteOpen(false)} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"><X className="size-5" /></button>
            </div>
            <div className="mt-6 space-y-3">
              {items.map((item, index) => (
                <div key={item.key} className="grid gap-3 rounded-xl border border-white/10 p-3 sm:grid-cols-[1fr_90px_130px_auto]">
                  <input aria-label={`Descripción ${index + 1}`} required value={item.description} onChange={(event) => setItems((current) => current.map((candidate) => candidate.key === item.key ? { ...candidate, description: event.target.value } : candidate))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-red-400" />
                  <input aria-label={`Cantidad ${index + 1}`} required type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => setItems((current) => current.map((candidate) => candidate.key === item.key ? { ...candidate, quantity: Number(event.target.value) } : candidate))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none" />
                  <input aria-label={`Precio ${index + 1}`} required type="number" min="0" step="0.01" value={item.unit_price_cents / 100} onChange={(event) => setItems((current) => current.map((candidate) => candidate.key === item.key ? { ...candidate, unit_price_cents: Math.round(Number(event.target.value) * 100) } : candidate))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none" />
                  <button type="button" aria-label="Eliminar concepto" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((candidate) => candidate.key !== item.key))} className="rounded-lg p-2 text-zinc-500 hover:text-red-300 disabled:opacity-30"><X className="size-4" /></button>
                </div>
              ))}
              <button type="button" onClick={() => setItems((current) => [...current, { key: crypto.randomUUID(), description: '', quantity: 1, unit_price_cents: 0 }])} className="inline-flex items-center gap-2 text-sm text-zinc-300"><Plus className="size-4" /> Añadir concepto</button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-zinc-400">Descuento USD<input name="discount" type="number" min="0" step="0.01" defaultValue="0" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" /></label>
              <label className="text-sm text-zinc-400">Impuesto %<input name="tax" type="number" min="0" max="100" step="0.01" defaultValue="0" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" /></label>
              <label className="text-sm text-zinc-400 sm:col-span-2">Notas<textarea name="notes" rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white" /></label>
            </div>
            <button disabled={busy} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold transition hover:bg-red-600 disabled:opacity-50">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />} Enviar propuesta segura</button>
          </form>
        </div>
      )}
    </div>
  );
}
