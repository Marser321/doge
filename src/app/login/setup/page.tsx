'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, LoaderCircle } from 'lucide-react';

import { getBrowserSupabase } from '@/lib/supabase/client';

export default function PasswordSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') || '');
    const confirmation = String(form.get('confirmation') || '');
    if (password.length < 10 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError('Usa al menos 10 caracteres, mayúscula, minúscula y número.');
      return;
    }
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const supabase = getBrowserSupabase();
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('El enlace venció o ya fue utilizado. Solicita uno nuevo.');
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      const response = await fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('El acceso no está habilitado. Contacta al owner de DOGE.');
      const staff = await response.json();
      const destination = staff.role === 'crew' ? '/dashboard/crew' : '/admin';
      router.replace(staff.needs_mfa ? `/login/mfa?next=${encodeURIComponent(destination)}` : destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar la contraseña.');
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0b0c] px-5 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <KeyRound className="mx-auto size-9 text-red-300" aria-hidden />
        <h1 className="mt-5 text-center text-2xl font-semibold">Crea tu contraseña</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">Completa la invitación o recuperación de tu acceso DOGE.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm text-zinc-300">Nueva contraseña
            <input required name="password" type="password" minLength={10} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 outline-none focus:border-red-400" />
          </label>
          <label className="block text-sm text-zinc-300">Confirmar contraseña
            <input required name="confirmation" type="password" minLength={10} autoComplete="new-password" className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 outline-none focus:border-red-400" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>}
          <button disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold transition hover:bg-red-600 disabled:opacity-50">
            {loading && <LoaderCircle className="size-4 animate-spin" />} Guardar y continuar
          </button>
        </form>
      </section>
    </main>
  );
}
