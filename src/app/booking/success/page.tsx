'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function BookingConfirmation() {
  const reference = useSearchParams().get('reference');

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0b0c] px-5 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center shadow-2xl shadow-black/30 sm:p-12">
        <Image src="/doge-logo-transparent.png" alt="DOGE" width={64} height={64} className="mx-auto h-16 w-16 object-contain" priority />
        <CheckCircle2 className="mx-auto mt-8 size-12 text-red-300" aria-hidden />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Solicitud registrada</h1>
        {reference ? (
          <p className="mt-5 text-zinc-300">Tu referencia es <strong className="font-mono text-white">{reference}</strong>. Guárdala para cualquier consulta.</p>
        ) : (
          <p className="mt-5 text-zinc-300">Recibimos la solicitud. Te contactaremos para confirmar los próximos pasos.</p>
        )}
        <p className="mt-4 text-sm leading-6 text-zinc-400">La fecha indicada es una preferencia. Un responsable verificará alcance y disponibilidad antes de confirmar el servicio.</p>
        <Link href="/" className="mt-8 inline-flex rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5">Volver al inicio</Link>
      </section>
    </main>
  );
}

export default function BookingSuccessPage() {
  return <Suspense fallback={<main className="min-h-screen bg-[#0b0b0c]" />}><BookingConfirmation /></Suspense>;
}
