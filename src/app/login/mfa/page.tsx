'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { KeyRound, LoaderCircle, ShieldCheck } from 'lucide-react';

import { getBrowserSupabase } from '@/lib/supabase/client';
import { safeInternalPath } from '@/lib/domain';

type TotpEnrollment = { id: string; qrCode: string; secret: string };

function MfaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [factorId, setFactorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function prepare() {
      const supabase = getBrowserSupabase();
      const { data: factors, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw factorError;
      const verified = factors.totp.find((factor: { status: string; id: string }) => factor.status === 'verified');
      if (verified) {
        if (active) setFactorId(verified.id);
        return;
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'DOGE CRM',
      });
      if (enrollError) throw enrollError;
      if (active) {
        setFactorId(data.id);
        setEnrollment({ id: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
      }
    }
    prepare()
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No fue posible preparar MFA.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = new FormData(event.currentTarget);
      const code = String(form.get('code') || '').replace(/\s/g, '');
      const { error: verifyError } = await getBrowserSupabase().auth.mfa.challengeAndVerify({
        factorId,
        code,
      });
      if (verifyError) throw verifyError;
      router.replace(safeInternalPath(searchParams.get('next'), '/admin'));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Código inválido.');
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0b0c] px-5 text-white">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8">
        <ShieldCheck className="mx-auto size-9 text-red-300" aria-hidden />
        <h1 className="mt-5 text-center text-2xl font-semibold">Verificación en dos pasos</h1>
        {loading && !factorId ? (
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400"><LoaderCircle className="size-4 animate-spin" /> Preparando acceso seguro…</p>
        ) : (
          <>
            {enrollment && (
              <div className="mt-6 rounded-2xl bg-white p-4 text-center text-black">
                <p className="mb-3 text-sm font-semibold">Escanea este código con tu aplicación autenticadora</p>
                <Image src={enrollment.qrCode} alt="Código QR para configurar MFA" width={220} height={220} unoptimized className="mx-auto" />
                <p className="mt-3 break-all font-mono text-xs text-zinc-700">{enrollment.secret}</p>
              </div>
            )}
            <form onSubmit={verify} className="mt-6 space-y-4">
              <label className="block text-sm text-zinc-300">Código de seis dígitos
                <input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-center font-mono text-xl tracking-[0.4em] outline-none focus:border-red-400" />
              </label>
              {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-100">{error}</p>}
              <button disabled={loading || !factorId} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold transition hover:bg-red-600 disabled:opacity-50">
                <KeyRound className="size-4" /> Verificar
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default function MfaPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#0b0b0c]" />}>
      <MfaForm />
    </Suspense>
  );
}
