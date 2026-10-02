'use client';

import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, CheckCircle2, ImagePlus, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SERVICES } from '@/content/services';
import { newYorkDate } from '@/lib/domain';
import { BrandMark } from '@/components/brand/BrandMark';

type SubmissionState = 'idle' | 'submitting' | 'error';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceQuery = searchParams.get('service') || '';
  const formRef = useRef<HTMLFormElement>(null);
  const idempotencyKey = useRef<string | null>(null);
  const [state, setState] = useState<SubmissionState>('idle');
  const [selectedService, setSelectedService] = useState<string>(serviceQuery);
  const [error, setError] = useState('');
  const minimumDate = useMemo(() => newYorkDate(new Date()), []);

  useEffect(() => {
    if (serviceQuery) {
      setSelectedService(serviceQuery);
    }
  }, [serviceQuery]);

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

  const inputClass = 'mt-2 w-full rounded-xl border border-strong bg-surface-1 px-4 py-3 text-sm text-primary outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-500/20';
  const labelClass = 'block text-xs font-semibold uppercase tracking-[0.14em] text-secondary';

  return (
    <main className="min-h-screen bg-surface-0 text-primary">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary">
          <ArrowLeft className="size-4" aria-hidden /> Volver al inicio
        </Link>
        <BrandMark size="md" priority />
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:pt-16">
        <div className="lg:sticky lg:top-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-200">
            <ShieldCheck className="size-4" aria-hidden /> Solicitud de servicio
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Coordinemos una visita.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-secondary">
            Cuéntanos sobre la propiedad y el servicio que necesitas. Un responsable revisará la información y te contactará para confirmar disponibilidad y alcance.
          </p>
          <div className="mt-10 space-y-5 border-l border-strong pl-5 text-sm text-secondary">
            <p className="flex gap-3"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-red-300" /> Recibirás una referencia al enviar el formulario.</p>
            <p className="flex gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-red-300" /> La fecha es una preferencia, no una confirmación automática.</p>
            <p className="flex gap-3"><ImagePlus className="mt-0.5 size-4 shrink-0 text-red-300" /> Las fotos son opcionales y se guardan de forma privada.</p>
          </div>
        </div>

        <form ref={formRef} onSubmit={submit} className="rounded-3xl border border-subtle bg-surface-1 p-5 shadow-2xl shadow-black/30 sm:p-8" noValidate>
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

            <div className="border-t border-subtle pt-8">
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
                  <select
                    required
                    name="service_code"
                    className={inputClass}
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                  >
                    <option value="" disabled>Selecciona una opción</option>
                    {SERVICES.map((service) => (
                      <option key={service.id} value={service.id}>{service.bookingLabel.es}</option>
                    ))}
                  </select>
                </label>
                <label className={labelClass}>Fecha preferida
                  <input name="preferred_date" type="date" min={minimumDate} className={inputClass} />
                </label>
                <label className={labelClass}>Horario preferido
                  <select name="preferred_time" className={inputClass} defaultValue="morning">
                    <option value="morning">Mañana (8:00 AM - 12:00 PM)</option>
                    <option value="afternoon">Tarde (12:00 PM - 5:00 PM)</option>
                    <option value="flexible">Flexible / A convenir</option>
                  </select>
                </label>
                {selectedService === 'window-cleaning' ? (
                  <>
                    <label className={labelClass}>Número de ventanas
                      <input name="windows_count" type="number" min="1" inputMode="numeric" placeholder="Ej. 10" className={inputClass} />
                    </label>
                    <label className={labelClass}>Número de puertas
                      <input name="doors_count" type="number" min="0" inputMode="numeric" placeholder="Ej. 2" className={inputClass} />
                    </label>
                  </>
                ) : selectedService ? (
                  <label className={`${labelClass} sm:col-span-2`}>Superficie aproximada (ft²)
                    <span className="block text-[11px] font-normal lowercase tracking-normal text-secondary mt-0.5">
                      (Para alfombras, tapetes o lavado a presión de pisos y exteriores)
                    </span>
                    <input name="square_feet" type="number" min="1" inputMode="numeric" placeholder="Ej. 1500" className={inputClass} />
                  </label>
                ) : (
                  <div className="sm:col-span-2 rounded-xl border border-dashed border-strong bg-surface-1 p-4 text-center text-xs text-secondary">
                    Selecciona un servicio arriba para especificar ventanas/puertas o superficie aproximada en pies cuadrados (ft²).
                  </div>
                )}
                <label className={`${labelClass} sm:col-span-2`}>Detalles relevantes
                  <textarea name="notes" rows={4} maxLength={2000} className={inputClass} placeholder="Accesos, superficies, prioridad, horarios u otra información útil." />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Fotos opcionales <span className="normal-case tracking-normal text-muted">(hasta 4 imágenes, 5 MB cada una)</span>
                  <input name="photos" type="file" accept="image/*" multiple className="mt-2 block w-full cursor-pointer text-sm text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-surface-3 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-surface-3" />
                </label>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm leading-6 text-secondary">
              <input required name="consent" value="accepted" type="checkbox" className="mt-1 size-4 rounded border-strong bg-transparent accent-red-500" />
              Autorizo a DOGE a usar estos datos exclusivamente para evaluar y gestionar esta solicitud.
            </label>

            {state === 'error' && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
            <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60">
              {state === 'submitting' && <LoaderCircle data-motion="progress" className="size-4 animate-spin" aria-hidden />}
              {state === 'submitting' ? 'Enviando solicitud…' : 'Enviar solicitud'}
            </button>
          </fieldset>
        </form>
      </section>
    </main>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-surface-0 text-primary grid place-items-center">
        <LoaderCircle data-motion="progress" className="size-8 animate-spin text-red-500" />
      </main>
    }>
      <BookingForm />
    </Suspense>
  );
}
