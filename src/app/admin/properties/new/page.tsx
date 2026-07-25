'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, LoaderCircle, Save } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { db, type Client } from '@/lib/db';

function PropertyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    db.clients.getAll().then((result) => {
      setClients(result.data || []);
      setError(result.error?.message || '');
    }).finally(() => setLoading(false));
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const result = await db.properties.create({
      client_id: String(form.get('client_id')),
      label: String(form.get('label') || ''),
      address: String(form.get('address')),
      city: String(form.get('city')),
      region: String(form.get('region') || 'FL'),
      postal_code: String(form.get('postal_code') || ''),
      property_type: String(form.get('property_type')),
      square_feet: form.get('square_feet') ? Number(form.get('square_feet')) : undefined,
      bedrooms: form.get('bedrooms') ? Number(form.get('bedrooms')) : undefined,
      bathrooms: form.get('bathrooms') ? Number(form.get('bathrooms')) : undefined,
      access_notes: String(form.get('access_notes') || ''),
    });
    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }
    router.push('/admin/subscriptions/new');
  }
  const input = 'mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white';
  return (
    <div className="mx-auto max-w-3xl pb-20">
      <Link href="/admin/subscriptions/new" className="inline-flex items-center gap-2 text-sm text-zinc-400"><ArrowLeft className="size-4" /> Volver</Link>
      <div className="mt-5"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Clientes</p><h1 className="mt-2 text-3xl font-semibold">Registrar propiedad</h1></div>
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      {loading ? <div className="grid min-h-72 place-items-center"><LoaderCircle className="size-6 animate-spin" /></div> : (
        <form onSubmit={submit} className="mt-7 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4"><Building2 className="size-5 text-red-300" /><h2 className="font-semibold">Ubicación y acceso</h2></div>
          <label className="block text-sm text-zinc-400">Cliente<select required name="client_id" defaultValue={params.get('clientId') || ''} className={input}><option value="">Selecciona un cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm text-zinc-400 sm:col-span-2">Etiqueta<input name="label" placeholder="Residencia principal" className={input} /></label>
            <label className="text-sm text-zinc-400 sm:col-span-2">Dirección<input required name="address" className={input} /></label>
            <label className="text-sm text-zinc-400">Ciudad<input required name="city" className={input} /></label>
            <label className="text-sm text-zinc-400">Estado<input required name="region" defaultValue="FL" className={input} /></label>
            <label className="text-sm text-zinc-400">Código postal<input name="postal_code" className={input} /></label>
            <label className="text-sm text-zinc-400">Tipo<select required name="property_type" defaultValue="Residencial" className={input}><option>Residencial</option><option>Condominio</option><option>Comercial</option><option>Hospitalidad</option></select></label>
            <label className="text-sm text-zinc-400">Superficie ft²<input name="square_feet" type="number" min="1" className={input} /></label>
            <label className="text-sm text-zinc-400">Habitaciones<input name="bedrooms" type="number" min="0" className={input} /></label>
            <label className="text-sm text-zinc-400">Baños<input name="bathrooms" type="number" min="0" step="0.5" className={input} /></label>
            <label className="text-sm text-zinc-400 sm:col-span-2">Notas de acceso<textarea name="access_notes" rows={3} className={input} /></label>
          </div>
          <button disabled={saving} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />} Guardar propiedad</button>
        </form>
      )}
    </div>
  );
}

export default function NewPropertyPage() {
  return <Suspense fallback={<div className="grid min-h-72 place-items-center"><LoaderCircle className="size-6 animate-spin" /></div>}><PropertyForm /></Suspense>;
}
