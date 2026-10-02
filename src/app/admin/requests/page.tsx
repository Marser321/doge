'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { 
  CalendarPlus, 
  CheckCircle2, 
  LoaderCircle, 
  Plus, 
  Send, 
  X, 
  Search, 
  MessageSquare, 
  Copy, 
  Check, 
  Clock
} from 'lucide-react';

import { db } from '@/lib/db';
import type { QuoteItem, RequestStatus, ServiceRequest } from '@/lib/types';
import { CrmPageIntro, CrmStatusPill } from '@/components/admin/CrmPrimitives';

const columns: Array<{ status: RequestStatus; label: string; dotBg: string; borderAccent: string }> = [
  { status: 'new', label: 'Nuevas', dotBg: 'bg-amber-400', borderAccent: 'hover:border-amber-400/40' },
  { status: 'reviewing', label: 'En revisión', dotBg: 'bg-sky-400', borderAccent: 'hover:border-sky-400/40' },
  { status: 'quoted', label: 'Cotizadas', dotBg: 'bg-indigo-400', borderAccent: 'hover:border-indigo-400/40' },
  { status: 'approved', label: 'Aprobadas', dotBg: 'bg-emerald-400', borderAccent: 'hover:border-emerald-400/40' },
  { status: 'scheduled', label: 'Programadas', dotBg: 'bg-cyan-400', borderAccent: 'hover:border-cyan-400/40' },
  { status: 'in_progress', label: 'En curso', dotBg: 'bg-purple-400', borderAccent: 'hover:border-purple-400/40' },
  { status: 'completed', label: 'Completadas', dotBg: 'bg-teal-400', borderAccent: 'hover:border-teal-400/40' },
];

function requestTone(status: RequestStatus) {
  if (status === 'completed') return 'success' as const;
  if (status === 'cancelled') return 'danger' as const;
  if (status === 'new' || status === 'reviewing') return 'warning' as const;
  return 'info' as const;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-US', { dateStyle: 'medium', timeZone: 'America/New_York' }).format(new Date(value));
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [generatedApprovalUrl, setGeneratedApprovalUrl] = useState<string | null>(null);
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

  useEffect(() => { 
    load(); 
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter requests by search term
  const filteredRequests = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return requests;
    return requests.filter((r) => 
      r.contact_name?.toLowerCase().includes(query) ||
      r.reference_code?.toLowerCase().includes(query) ||
      r.contact_phone?.includes(query) ||
      r.contact_email?.toLowerCase().includes(query) ||
      r.service_name_snapshot?.toLowerCase().includes(query) ||
      r.notes?.toLowerCase().includes(query) ||
      r.property?.address?.toLowerCase().includes(query)
    );
  }, [requests, searchQuery]);

  const grouped = useMemo(() => Object.fromEntries(columns.map((column) => [
    column.status,
    filteredRequests.filter((request) => request.status === column.status),
  ])) as Record<RequestStatus, ServiceRequest[]>, [filteredRequests]);

  async function transition(status: RequestStatus, note?: string) {
    if (!selected) return;
    setBusy(true);
    setError('');
    const result = await db.requests.transition(selected.id, status, note);
    if (result.error) {
      setError(result.error.message);
    } else {
      const targetCol = columns.find(c => c.status === status);
      setToast(`Solicitud ${selected.reference_code} movida a "${targetCol?.label || status}"`);
    }
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
    if (result.error) {
      setError(result.error.message);
    } else {
      setQuoteOpen(false);
      const url = result.data?.approval_url;
      if (url) {
        setGeneratedApprovalUrl(url);
        await navigator.clipboard?.writeText(url).catch(() => undefined);
        setToast('¡Cotización generada y enlace copiado al portapapeles!');
      } else {
        setToast('¡Cotización registrada con éxito!');
      }
    }
    await load();
    setBusy(false);
  }

  const nextAction = selected?.status === 'new'
    ? { label: 'Iniciar revisión', status: 'reviewing' as RequestStatus }
    : selected?.status === 'in_progress'
      ? { label: 'Marcar completada', status: 'completed' as RequestStatus }
      : null;

  // Extract structured notes (e.g. Preferred time, Windows, Doors, Sqft)
  const structuredNotes = useMemo(() => {
    if (!selected?.notes) return null;
    const parts = selected.notes.split('\n\n');
    const headerLine = parts[0] || '';
    const items = headerLine.split(' | ').map(p => p.trim()).filter(Boolean);
    const hasStructured = items.some(i => i.includes(':'));
    if (!hasStructured) return null;
    return {
      badges: items,
      freeText: parts.slice(1).join('\n\n')
    };
  }, [selected]);

  // WhatsApp link generator
  const whatsappUrl = useMemo(() => {
    if (!selected?.contact_phone) return null;
    const cleanPhone = selected.contact_phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return null;
    const greeting = `Hola ${selected.contact_name}, te saludamos de DOGE Services respecto a tu solicitud de ${selected.service_name_snapshot} (${selected.reference_code}).`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`;
  }, [selected]);

  if (loading) return (
    <div className="grid min-h-96 place-items-center">
      <LoaderCircle data-motion="progress" className="size-8 animate-spin text-muted" />
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CrmPageIntro 
          eyebrow="Operación · Solicitudes" 
          title="Pipeline de solicitudes" 
          description="Evaluación, cotización, aprobación y ejecución en un solo historial." 
        />
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente, código, teléfono..."
            className="w-full rounded-xl border border-subtle bg-surface-1 pl-10 pr-4 py-2.5 text-xs text-primary placeholder:text-muted outline-none focus:border-red-400/50 transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-3 text-sm text-tone-success shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      {/* Quote link copied banner */}
      {generatedApprovalUrl && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-tone-warning/30 bg-tone-warning/10 p-4 text-sm text-tone-warning">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="size-5 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-primary">Enlace de aprobación listo para el cliente</p>
              <p className="text-xs text-tone-warning/80 mt-0.5 truncate max-w-md">{generatedApprovalUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(generatedApprovalUrl);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400/30 transition-all"
            >
              {copiedLink ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copiedLink ? 'Copiado' : 'Copiar enlace'}
            </button>
            <button
              onClick={() => setGeneratedApprovalUrl(null)}
              className="p-1.5 text-tone-warning hover:text-primary"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className={`grid gap-6 ${selected ? 'xl:grid-cols-[1fr_400px] 2xl:grid-cols-[1fr_440px]' : 'grid-cols-1'}`}>
        {/* Kanban Board Columns */}
        <section className="overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex gap-3.5 min-w-max">
            {columns.map((column) => {
              const columnRequests = grouped[column.status] || [];
              return (
                <div key={column.status} className={`w-[260px] shrink-0 rounded-2xl border border-subtle bg-surface-1 p-3 flex flex-col min-h-[520px] shadow-sm transition-colors ${column.borderAccent}`}>
                  <div className="flex items-center justify-between px-1 pb-3 border-b border-subtle">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`size-2 rounded-full ${column.dotBg} shrink-0`} />
                      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 truncate">
                        {column.label}
                      </h2>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-surface-3 text-primary font-semibold shrink-0">
                      {columnRequests.length}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 flex-1">
                    {columnRequests.length === 0 ? (
                      <div className="h-32 grid place-items-center rounded-xl border border-dashed border-subtle bg-white/[0.01] p-3 text-center">
                        <span className="text-[11px] font-medium text-secondary">Sin solicitudes</span>
                      </div>
                    ) : (
                      columnRequests.map((request) => (
                        <button 
                          key={request.id} 
                          onClick={() => setSelected(request)} 
                          className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
                            selected?.id === request.id 
                              ? 'border-red-400/60 bg-red-500/10 shadow-lg shadow-red-950/20 ring-1 ring-red-400/40' 
                              : 'border-subtle bg-black/30 hover:border-strong hover:bg-surface-1'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-1 text-sm font-semibold text-primary">
                              {request.contact_name}
                            </p>
                            <span className="font-mono text-[10px] text-secondary shrink-0">
                              {request.reference_code.slice(-4)}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-1 text-xs text-secondary">
                            {request.service_name_snapshot}
                          </p>

                          {request.preferred_date && (
                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-secondary">
                              <Clock className="size-3 text-secondary" />
                              <span>{request.preferred_date}</span>
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Selected Request Detail Sidebar */}
        {selected && (
          <aside className="h-fit rounded-3xl border border-subtle bg-surface-1 p-6 xl:sticky xl:top-24 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-subtle">
                <div>
                  <p className="font-mono text-xs text-tone-danger font-semibold tracking-wider">
                    {selected.reference_code}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-primary tracking-tight">
                    {selected.contact_name}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <CrmStatusPill tone={requestTone(selected.status)}>
                    {columns.find((column) => column.status === selected.status)?.label || selected.status}
                  </CrmStatusPill>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1 rounded-lg text-secondary hover:text-primary hover:bg-surface-3 transition-colors"
                    title="Cerrar panel de detalle"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons for Contact & WhatsApp */}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-emerald-500/30 bg-tone-success/10 py-2.5 px-4 text-xs font-semibold text-tone-success hover:bg-emerald-500/20 transition-all"
                >
                  <MessageSquare className="size-4" />
                  Abrir chat en WhatsApp
                </a>
              )}

              {/* Detail Fields */}
              <dl className="space-y-4 text-xs">
                <div>
                  <dt className="text-[10px] uppercase font-bold tracking-wider text-muted">Servicio Solicitado</dt>
                  <dd className="mt-1 text-sm font-semibold text-primary">{selected.service_name_snapshot}</dd>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-muted">Email</dt>
                    <dd className="mt-1 text-secondary truncate" title={selected.contact_email || ''}>
                      {selected.contact_email || 'No indicado'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-muted">Teléfono</dt>
                    <dd className="mt-1 text-secondary">{selected.contact_phone || 'No indicado'}</dd>
                  </div>
                </div>

                <div>
                  <dt className="text-[10px] uppercase font-bold tracking-wider text-muted">Propiedad</dt>
                  <dd className="mt-1 text-secondary">
                    {selected.property?.address || 'Dirección pendiente'}<br />
                    <span className="text-muted">{selected.property?.city || 'South Florida'} · {selected.property?.property_type || 'Residencial'}</span>
                  </dd>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-muted">Fecha de Registro</dt>
                    <dd className="mt-1 text-secondary">{formatDate(selected.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-muted">Fecha Preferida</dt>
                    <dd className="mt-1 text-secondary">{selected.preferred_date || 'A convenir'}</dd>
                  </div>
                </div>

                {/* Structured Service Notes / Badges */}
                {structuredNotes && (
                  <div>
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1.5">Detalles del Servicio</dt>
                    <div className="flex flex-wrap gap-1.5">
                      {structuredNotes.badges.map((badge, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-200">
                          {badge}
                        </span>
                      ))}
                    </div>
                    {structuredNotes.freeText && (
                      <p className="mt-2 text-secondary whitespace-pre-wrap rounded-xl border border-subtle bg-surface-1 p-2.5">
                        {structuredNotes.freeText}
                      </p>
                    )}
                  </div>
                )}

                {!structuredNotes && selected.notes && (
                  <div>
                    <dt className="text-[10px] uppercase font-bold tracking-wider text-muted">Notas Adicionales</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-secondary rounded-xl border border-subtle bg-surface-1 p-2.5">
                      {selected.notes}
                    </dd>
                  </div>
                )}
              </dl>

              {/* Status Transition & Actions */}
              <div className="pt-4 border-t border-subtle space-y-3">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted">Acciones del Pipeline</p>

                {nextAction && (
                  <button 
                    disabled={busy} 
                    onClick={() => transition(nextAction.status)} 
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-bold text-black transition hover:opacity-90 disabled:opacity-50 shadow-lg"
                  >
                    {busy ? <LoaderCircle data-motion="progress" className="size-4 animate-spin" /> : <CheckCircle2 className="size-4 text-emerald-600" />} 
                    {nextAction.label}
                  </button>
                )}

                {selected.status === 'reviewing' && (
                  <button 
                    disabled={busy} 
                    onClick={() => setQuoteOpen(true)} 
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-xs font-bold text-white transition hover:bg-red-600 shadow-lg shadow-red-950/40"
                  >
                    <Send className="size-4" /> Crear y enviar cotización
                  </button>
                )}

                {selected.status === 'approved' && (
                  <a 
                    href={`/admin/calendar?request=${selected.id}`} 
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-xs font-bold text-white transition hover:bg-red-600 shadow-lg shadow-red-950/40"
                  >
                    <CalendarPlus className="size-4" /> Programar cita en agenda
                  </a>
                )}

                {/* Quick Status Override Dropdown for Owner/Manager */}
                <div className="pt-2">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-muted mb-1.5">
                    Mover a otro estado directamente:
                  </label>
                  <select
                    disabled={busy}
                    value={selected.status}
                    onChange={(e) => transition(e.target.value as RequestStatus)}
                    className="w-full rounded-xl border border-subtle bg-surface-1 px-3 py-2 text-xs text-secondary outline-none focus:border-red-400"
                  >
                    {columns.map((c) => (
                      <option key={c.status} value={c.status} className="bg-surface-1 text-primary">
                        {c.label}
                      </option>
                    ))}
                    <option value="cancelled" className="bg-surface-1 text-tone-danger">Cancelada</option>
                  </select>
                </div>

                {!['completed', 'cancelled'].includes(selected.status) && (
                  <button 
                    disabled={busy} 
                    onClick={cancel} 
                    className="w-full min-h-9 rounded-xl border border-red-400/20 px-4 text-xs text-tone-danger transition hover:bg-red-500/10 mt-1"
                  >
                    Cancelar solicitud
                  </button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Quotation Modal */}
      {quoteOpen && selected && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4 backdrop-blur-md">
          <form onSubmit={submitQuote} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-strong bg-surface-0 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-subtle">
              <div>
                <p className="text-xs uppercase tracking-wider text-tone-danger font-bold">Generador de Cotizaciones</p>
                <h2 className="mt-1 text-xl font-bold text-primary">Conceptos, precios y condiciones</h2>
              </div>
              <button type="button" onClick={() => setQuoteOpen(false)} className="rounded-lg p-2 text-secondary hover:bg-surface-3 hover:text-primary">
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider">Líneas de cotización</p>
              {items.map((item, index) => (
                <div key={item.key} className="grid gap-3 rounded-xl border border-subtle bg-surface-1 p-3 sm:grid-cols-[1fr_90px_130px_auto]">
                  <input 
                    aria-label={`Descripción ${index + 1}`} 
                    required 
                    value={item.description} 
                    placeholder="Descripción del concepto"
                    onChange={(event) => setItems((current) => current.map((candidate) => candidate.key === item.key ? { ...candidate, description: event.target.value } : candidate))} 
                    className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-xs text-primary outline-none focus:border-red-400" 
                  />
                  <input 
                    aria-label={`Cantidad ${index + 1}`} 
                    required 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    value={item.quantity} 
                    onChange={(event) => setItems((current) => current.map((candidate) => candidate.key === item.key ? { ...candidate, quantity: Number(event.target.value) } : candidate))} 
                    className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-xs text-primary outline-none" 
                  />
                  <input 
                    aria-label={`Precio ${index + 1}`} 
                    required 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={item.unit_price_cents / 100} 
                    onChange={(event) => setItems((current) => current.map((candidate) => candidate.key === item.key ? { ...candidate, unit_price_cents: Math.round(Number(event.target.value) * 100) } : candidate))} 
                    className="rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-xs text-primary outline-none" 
                  />
                  <button 
                    type="button" 
                    aria-label="Eliminar concepto" 
                    disabled={items.length === 1} 
                    onClick={() => setItems((current) => current.filter((candidate) => candidate.key !== item.key))} 
                    className="rounded-lg p-2 text-muted hover:text-tone-danger disabled:opacity-30"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setItems((current) => [...current, { key: crypto.randomUUID(), description: '', quantity: 1, unit_price_cents: 0 }])} 
                className="inline-flex items-center gap-2 text-xs text-tone-danger hover:text-tone-danger font-semibold mt-1"
              >
                <Plus className="size-3.5" /> Añadir otro concepto
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 pt-4 border-t border-subtle">
              <label className="text-xs text-secondary">
                Descuento especial (USD)
                <input name="discount" type="number" min="0" step="0.01" defaultValue="0" className="mt-1.5 w-full rounded-xl border border-subtle bg-surface-2 px-3 py-2 text-xs text-primary outline-none focus:border-red-400" />
              </label>
              <label className="text-xs text-secondary">
                Impuestos (%)
                <input name="tax" type="number" min="0" max="100" step="0.01" defaultValue="0" className="mt-1.5 w-full rounded-xl border border-subtle bg-surface-2 px-3 py-2 text-xs text-primary outline-none focus:border-red-400" />
              </label>
              <label className="text-xs text-secondary sm:col-span-2">
                Notas y términos para el cliente
                <textarea name="notes" rows={3} placeholder="Condiciones de pago, validez de la oferta..." className="mt-1.5 w-full rounded-xl border border-subtle bg-surface-2 px-3 py-2 text-xs text-primary outline-none focus:border-red-400 resize-none" />
              </label>
            </div>

            <button 
              disabled={busy} 
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold text-xs text-white shadow-lg shadow-red-950/50 transition hover:bg-red-600 disabled:opacity-50"
            >
              {busy ? <LoaderCircle data-motion="progress" className="size-4 animate-spin" /> : <Send className="size-4" />} 
              {busy ? 'Generando propuesta...' : 'Generar propuesta y enlace seguro'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
