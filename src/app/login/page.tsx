'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, LoaderCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { getBrowserSupabase } from '@/lib/supabase/client';
import { safeInternalPath } from '@/lib/domain';
import { BrandMark } from '@/components/brand/BrandMark';

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
      const email = String(form.get('email') || '').trim();
      const password = String(form.get('password') || '');
      const { error: signInError } = await getBrowserSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      const rawNext = searchParams.get('next');
      const next = safeInternalPath(rawNext, '');
      const identity = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
      const staff = identity.ok ? await identity.json() : null;
      if (staff?.needs_mfa) {
        router.replace(`/login/mfa?next=${encodeURIComponent(next.startsWith('/admin') ? next : '/admin')}`);
      } else if (staff) {
        router.replace(next.startsWith('/admin') || next.startsWith('/dashboard/crew') ? next : '/admin');
      } else {
        // Not staff: this is a customer, and their home is the account panel.
        router.replace(next && !next.startsWith('/admin') && !next.startsWith('/dashboard/crew') ? next : '/account');
      }
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible iniciar sesión.');
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-surface-0 px-5 py-12 text-primary">
      <section className="w-full max-w-md rounded-3xl border border-subtle bg-surface-1 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-primary">
          <ArrowLeft className="size-4" /> Inicio
        </Link>
        <BrandMark size="xl" priority className="mx-auto mt-4" />
        <h1 className="mt-6 text-center text-2xl font-bold font-michroma uppercase tracking-tight">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-center text-sm text-secondary">
          Ingresa a tu cuenta de DOGE.S.M
        </p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary">
            Email
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@email.com"
              className="mt-2 w-full rounded-xl border border-strong bg-surface-1 px-4 py-3 text-primary outline-none focus:border-strong transition-colors text-sm"
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-widest text-secondary">
            Contraseña
            <input
              required
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-strong bg-surface-1 px-4 py-3 text-primary outline-none focus:border-strong transition-colors text-sm"
            />
          </label>
          {error && (
            <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-3 text-sm font-bold uppercase tracking-wider transition hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <LoaderCircle data-motion="progress" className="size-4 animate-spin text-black" /> Ingresando…
              </>
            ) : (
              <>
                <LogIn className="size-4" /> Iniciar sesión
              </>
            )}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-3 text-center text-sm">
          <Link
            href="/signup"
            className="text-secondary hover:text-primary transition inline-flex items-center justify-center gap-1.5 font-medium"
          >
            ¿No tienes cuenta? <span className="underline underline-offset-4 text-primary font-bold">Crear cuenta</span>
          </Link>
          <Link
            href="/login/recover"
            className="text-muted transition hover:text-secondary text-xs"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-0" />}>
      <LoginForm />
    </Suspense>
  );
}
