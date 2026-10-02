'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { BrandMark } from '@/components/brand/BrandMark';

function BookingConfirmation() {
  const reference = useSearchParams().get('reference');

  return (
    <main className="grid min-h-screen place-items-center bg-surface-0 px-5 text-primary">
      <section className="w-full max-w-xl rounded-3xl border border-subtle bg-surface-1 p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
        <BrandMark size="xl" priority className="mx-auto" />
        <CheckCircle2 className="mx-auto mt-8 size-12 text-red-300" aria-hidden />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Solicitud registrada</h1>
        {reference ? (
          <p className="mt-5 text-secondary">Tu referencia es <strong className="font-mono text-primary">{reference}</strong>. Guárdala para cualquier consulta.</p>
        ) : (
          <p className="mt-5 text-secondary">Recibimos la solicitud. Te contactaremos para confirmar los próximos pasos.</p>
        )}
        <p className="mt-4 text-sm leading-6 text-secondary">La fecha indicada es una preferencia. Un responsable verificará alcance y disponibilidad antes de confirmar el servicio.</p>
        <Link href="/" className="mt-8 inline-flex rounded-xl border border-strong px-5 py-3 text-sm font-medium text-primary transition hover:border-strong hover:bg-surface-2">Volver al inicio</Link>
      </section>
    </main>
  );
}

export default function BookingSuccessPage() {
  return <Suspense fallback={<main className="min-h-screen bg-surface-0" />}><BookingConfirmation /></Suspense>;
}
