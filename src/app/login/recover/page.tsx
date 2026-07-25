'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react';

import { getBrowserSupabase } from '@/lib/supabase/client';

export default function PasswordRecoveryPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const email = String(new FormData(event.currentTarget).get('email') || '').trim().toLowerCase();
    try {
      const { error: recoveryError } = await getBrowserSupabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/login/setup`,
      });
      if (recoveryError) throw recoveryError;
      setMessage('Si la cuenta existe, recibirás un enlace para crear una nueva contraseña.');
    } catch {
      setError('No fue posible iniciar la recuperación. Intenta nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0b0c] px-5 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="size-4" /> Volver</Link>
        <Mail className="mx-auto mt-5 size-9 text-red-300" aria-hidden />
        <h1 className="mt-5 text-center text-2xl font-semibold">Recuperar acceso</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Enviaremos el enlace al email registrado.</p>
        {message ? (
          <p role="status" className="mt-8 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{message}</p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block text-sm text-zinc-300">Email
              <input required name="email" type="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 outline-none focus:border-red-400" />
            </label>
            {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>}
            <button disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold transition hover:bg-red-600 disabled:opacity-50">
              {loading && <LoaderCircle className="size-4 animate-spin" />} Enviar enlace
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
