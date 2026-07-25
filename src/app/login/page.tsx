'use client';

import { FormEvent, Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { getBrowserSupabase } from '@/lib/supabase/client';
import { safeInternalPath } from '@/lib/domain';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await getBrowserSupabase().auth.signInWithPassword({
        email: String(form.get('email') || ''),
        password: String(form.get('password') || ''),
      });
      if (signInError) throw signInError;
      const next = safeInternalPath(searchParams.get('next'), '/admin');
      const identity = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
      const staff = identity.ok ? await identity.json() : null;
      if (staff?.needs_mfa) {
        router.replace(`/login/mfa?next=${encodeURIComponent(next.startsWith('/admin') ? next : '/admin')}`);
      } else {
        router.replace(next.startsWith('/admin') || next.startsWith('/dashboard/crew') ? next : '/admin');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible iniciar sesión.');
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0b0c] px-5 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/30">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"><ArrowLeft className="size-4" /> Inicio</Link>
        <Image src="/doge-logo-transparent.png" alt="DOGE" width={58} height={58} className="mx-auto mt-4 h-14 w-14 object-contain" priority />
        <h1 className="mt-6 text-center text-2xl font-semibold">Acceso operativo</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Solo personal autorizado.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm text-zinc-300">Email
            <input required name="email" type="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-red-400" />
          </label>
          <label className="block text-sm text-zinc-300">Contraseña
            <input required name="password" type="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-red-400" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>}
          <button disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold transition hover:bg-red-600 disabled:opacity-60">
            {loading && <LoaderCircle className="size-4 animate-spin" />} {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
        <Link href="/login/recover" className="mt-5 block text-center text-sm text-zinc-400 transition hover:text-white">
          ¿Olvidaste tu contraseña?
        </Link>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#0b0b0c]" />}><LoginForm /></Suspense>;
}
