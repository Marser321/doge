'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, Repeat, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { db, type Client } from '@/lib/db';

type Option = Record<string, unknown>;

export default function NewSubscriptionPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Option[]>([]);
  const [plans, setPlans] = useState<Option[]>([]);
  const [services, setServices] = useState<Option[]>([]);
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([db.clients.getAll(), db.properties.getAll(), db.subscriptionPlans.getAll(), db.services.getAll()])
      .then(([clientResult, propertyResult, planResult, serviceResult]) => {
        setClients(clientResult.data || []);
        setProperties(propertyResult.data || []);
        setPlans(planResult.data || []);
        setServices(serviceResult.data || []);
        setError(clientResult.error?.message || propertyResult.error?.message || planResult.error?.message || serviceResult.error?.message || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const availableProperties = useMemo(() => properties.filter((property) => property.client_id === clientId), [clientId, properties]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const result = await db.subscriptions.create({
      client_id: String(form.get('client_id')),
      property_id: String(form.get('property_id')),
      tier_id: String(form.get('tier_id')),
      service_id: String(form.get('service_id')),
      status: String(form.get('status')) as 'Active',
      mrr: Number(form.get('mrr')),
      preferred_weekday: Number(form.get('preferred_weekday')),
      started_at: String(form.get('started_at')),
      next_billing_date: String(form.get('next_occurrence')),
    });
    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }
    router.push('/admin/subscriptions');
    router.refresh();
  }

  const input = 'mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-400';
  return (
    <div className="mx-auto max-w-4xl pb-20">
      <Link href="/admin/subscriptions" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="size-4" /> Volver a suscripciones</Link>
      <div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Recurrencia operativa</p><h1 className="mt-2 text-3xl font-semibold text-white">Nueva suscripción</h1><p className="mt-2 text-sm text-zinc-400">Generará solicitudes aprobadas automáticamente hasta 30 días por adelantado.</p></div>
      {error && <p role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      {loading ? <div className="grid min-h-72 place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div> : (
        <form onSubmit={submit} className="mt-7 space-y-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4"><Repeat className="size-5 text-red-300" /><h2 className="font-semibold">Contrato y servicio</h2></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-zinc-400 sm:col-span-2">Cliente<select required name="client_id" value={clientId} onChange={(event) => setClientId(event.target.value)} className={input}><option value="">Selecciona un cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
            <label className="text-sm text-zinc-400 sm:col-span-2">Propiedad<select required name="property_id" defaultValue="" className={input}><option value="">Selecciona una propiedad</option>{availableProperties.map((property) => <option key={String(property.id)} value={String(property.id)}>{String(property.address)} · {String(property.city)}</option>)}</select>{clientId && !availableProperties.length && <Link href={`/admin/properties/new?clientId=${clientId}`} className="mt-2 block text-xs text-amber-300 underline">Este cliente todavía no tiene propiedades. Registrar una.</Link>}</label>
            <label className="text-sm text-zinc-400">Plan<select required name="tier_id" defaultValue="" className={input}><option value="">Selecciona un plan</option>{plans.map((plan) => <option key={String(plan.id)} value={String(plan.id)}>{String(plan.name)} · cada {String(plan.cadence_days)} días</option>)}</select></label>
            <label className="text-sm text-zinc-400">Servicio<select required name="service_id" defaultValue="" className={input}><option value="">Selecciona un servicio</option>{services.map((service) => <option key={String(service.id)} value={String(service.id)}>{String(service.name_es)}</option>)}</select></label>
            <label className="text-sm text-zinc-400">Valor mensual USD<input required name="mrr" type="number" min="0" step="0.01" className={input} /></label>
            <label className="text-sm text-zinc-400">Estado<select name="status" defaultValue="Active" className={input}><option>Active</option><option>Pending</option><option>Paused</option></select></label>
            <label className="text-sm text-zinc-400">Día preferido<select name="preferred_weekday" defaultValue="1" className={input}><option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miércoles</option><option value="4">Jueves</option><option value="5">Viernes</option><option value="6">Sábado</option><option value="0">Domingo</option></select></label>
            <label className="text-sm text-zinc-400">Inicio<input required name="started_at" type="date" className={input} /></label>
            <label className="text-sm text-zinc-400">Primera ocurrencia<input required name="next_occurrence" type="date" className={input} /></label>
          </div>
          <button disabled={saving || !clientId || !availableProperties.length} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold transition hover:bg-red-600 disabled:opacity-40">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} Crear suscripción</button>
        </form>
      )}
    </div>
  );
}
