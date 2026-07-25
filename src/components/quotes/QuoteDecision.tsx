'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react';

export default function QuoteDecision({ token, locale }: { token: string; locale: 'es' | 'en' }) {
  const [state, setState] = useState<'idle' | 'loading' | 'accepted' | 'declined' | 'error'>('idle');
  const [error, setError] = useState('');
  const idempotencyKeys = useRef<Partial<Record<'accepted' | 'declined', string>>>({});

  async function decide(decision: 'accepted' | 'declined') {
    setState('loading');
    setError('');
    idempotencyKeys.current[decision] ||= crypto.randomUUID();
    const response = await fetch(`/api/quotes/${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKeys.current[decision],
      },
      body: JSON.stringify({ decision }),
      credentials: 'same-origin',
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState('error');
      setError(payload.error || (locale === 'en' ? 'We could not record your decision.' : 'No fue posible registrar tu decisión.'));
      return;
    }
    setState(decision);
  }

  if (state === 'accepted') return <p className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-100"><CheckCircle2 className="size-5" /> {locale === 'en' ? 'Proposal accepted. Our team will contact you to coordinate the date.' : 'Cotización aprobada. El equipo te contactará para coordinar la fecha.'}</p>;
  if (state === 'declined') return <p className="flex items-center gap-2 rounded-2xl border border-zinc-500/30 bg-white/5 p-4 text-zinc-200"><XCircle className="size-5" /> {locale === 'en' ? 'Decision recorded. Thank you for letting us know.' : 'Decisión registrada. Gracias por informarnos.'}</p>;

  return (
    <div className="space-y-3">
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <button disabled={state === 'loading'} onClick={() => decide('accepted')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-700 px-5 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50">
          {state === 'loading' ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} {locale === 'en' ? 'Accept' : 'Aprobar'}
        </button>
        <button disabled={state === 'loading'} onClick={() => decide('declined')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 font-semibold text-zinc-200 transition hover:bg-white/5 disabled:opacity-50">
          <XCircle className="size-4" /> {locale === 'en' ? 'Decline' : 'Rechazar'}
        </button>
      </div>
    </div>
  );
}
