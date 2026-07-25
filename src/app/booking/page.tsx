'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, CheckCircle2, ImagePlus, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { newYorkDate } from '@/lib/domain';

type SubmissionState = 'idle' | 'submitting' | 'error';

export default function BookingPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const idempotencyKey = useRef<string | null>(null);
  const [state, setState] = useState<SubmissionState>('idle');
  const [error, setError] = useState('');
  const minimumDate = useMemo(() => newYorkDate(new Date()), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('submitting');
    setError('');

    try {
      idempotencyKey.current ||= crypto.randomUUID();
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey.current },
        body: new FormData(event.currentTarget),
      });
      const payload = await response.json();
      if (!response.ok || !payload.reference) throw new Error(payload.error || 'No pudimos registrar tu solicitud.');
      formRef.current?.reset();
      idempotencyKey.current = null;
      router.push(`/booking/success?reference=${encodeURIComponent(payload.reference)}`);
    } catch (cause) {
      setState('error');
      setError(cause instanceof Error ? cause.message : 'No pudimos registrar tu solicitud.');
      return;
    }
    setState('idle');
  }

  const inputClass = 'mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/20';
  const labelClass = 'block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-300';

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white">
          <ArrowLeft className="size-4" aria-hidden /> Volver al inicio
        </Link>
        <Image src="/doge-logo-transparent.png" alt="DOGE" width={44} height={44} className="h-11 w-11 object-contain" priority />
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:pt-16">
        <div className="lg:sticky lg:top-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200">
            <ShieldCheck className="size-4" aria-hidden /> Solicitud de servicio
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Coordinemos una visita.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
            Cuéntanos sobre la propiedad y el servicio que necesitas. Un responsable revisará la información y te contactará para confirmar disponibilidad y alcance.
          </p>
          <div className="mt-10 space-y-5 border-l border-white/15 pl-5 text-sm text-zinc-300">
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-300" /> Recibirás una referencia al enviar el formulario.</p>
            <p className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-red-300" /> La fecha es una preferencia, no una confirmación automática.</p>
            <p className="flex gap-3"><ImagePlus className="mt-0.5 size-4 shrink-0 text-red-300" /> Las fotos son opcionales y se guardan de forma privada.</p>
          </div>
        </div>

        <form ref={formRef} onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 sm:p-8" noValidate>
          <fieldset disabled={state === 'submitting'} className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold">Contacto</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>Nombre completo
                  <input required name="name" autoComplete="name" className={inputClass} />
                </label>
                <label className={labelClass}>Teléfono
                  <input required name="phone" type="tel" autoComplete="tel" className={inputClass} />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>Email
                  <input required name="email" type="email" autoComplete="email" className={inputClass} />
                </label>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8">
              <h2 className="text-lg font-semibold">Propiedad y necesidad</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className={`${labelClass} sm:col-span-2`}>Dirección
                  <input required name="address" autoComplete="street-address" className={inputClass} />
                </label>
                <label className={labelClass}>Ciudad
                  <input required name="city" autoComplete="address-level2" className={inputClass} />
                </label>
                <label className={labelClass}>Tipo de propiedad
                  <select required name="property_type" className={inputClass} defaultValue="">
                    <option value="" disabled>Selecciona una opción</option>
                    <option>Residencial</option>
                    <option>Condominio</option>
                    <option>Comercial</option>
                    <option>Hospitalidad</option>
                  </select>
                </label>
                <label className={labelClass}>Servicio
                  <select required name="service_code" className={inputClass} defaultValue="">
                    <option value="" disabled>Selecciona una opción</option>
                    <option value="residential-vip">Limpieza profunda</option>
                    <option value="window-cleaning">Cristales WFP</option>
                    <option value="post-construction">Post-construcción</option>
                    <option value="florida-control">Inspección y propuesta</option>
                  </select>
                </label>
                <label className={labelClass}>Fecha preferida
                  <input name="preferred_date" type="date" min={minimumDate} className={inputClass} />
                </label>
                <label className={labelClass}>Superficie aproximada (ft²)
                  <input name="square_feet" type="number" min="1" inputMode="numeric" className={inputClass} />
                </label>
                <label className={labelClass}>Habitaciones
                  <input name="bedrooms" type="number" min="0" inputMode="numeric" className={inputClass} />
                </label>
                <label className={labelClass}>Baños
                  <input name="bathrooms" type="number" min="0" inputMode="numeric" className={inputClass} />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>Detalles relevantes
                  <textarea name="notes" rows={4} maxLength={2000} className={inputClass} placeholder="Accesos, superficies, prioridad, horarios u otra información útil." />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Fotos opcionales <span className="normal-case tracking-normal text-zinc-500">(hasta 4 imágenes, 5 MB cada una)</span>
                  <input name="photos" type="file" accept="image/*" multiple className="mt-2 block w-full cursor-pointer text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15" />
                </label>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
              <input required name="consent" value="accepted" type="checkbox" className="mt-1 size-4 rounded border-white/30 bg-transparent accent-red-500" />
              Autorizo a DOGE a usar estos datos exclusivamente para evaluar y gestionar esta solicitud.
            </label>

            {state === 'error' && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
              {state === 'submitting' && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
              {state === 'submitting' ? 'Enviando solicitud…' : 'Enviar solicitud'}
            </button>
          </fieldset>
        </form>
      </section>
    </main>
  );
}
