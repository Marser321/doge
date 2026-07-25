import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import QuoteDecision from '@/components/quotes/QuoteDecision';
import { getPublicQuote } from '@/lib/server/repository';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

function money(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(cents) / 100);
}

export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let quote;
  try {
    quote = await getPublicQuote(token);
  } catch {
    notFound();
  }
  if (!quote) notFound();
  const request = Array.isArray(quote.service_request) ? quote.service_request[0] : quote.service_request;
  const items = Array.isArray(quote.quote_items) ? quote.quote_items : [];
  const locale = request?.locale === 'en' ? 'en' : 'es';
  const labels = locale === 'en'
    ? { eyebrow: 'Service proposal', hello: 'Hello', intro: 'This is the proposal for', subtotal: 'Subtotal', discount: 'Discount', taxes: 'Taxes', total: 'Total', valid: 'Valid until', note: 'Approval does not automatically confirm a date.' }
    : { eyebrow: 'Propuesta de servicio', hello: 'Hola', intro: 'Esta es la propuesta para', subtotal: 'Subtotal', discount: 'Descuento', taxes: 'Impuestos', total: 'Total', valid: 'Válida hasta', note: 'La aprobación no confirma automáticamente una fecha.' };

  return (
    <main className="min-h-screen bg-[#0b0b0c] px-5 py-8 text-white sm:py-14">
      <section className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="DOGE inicio"><Image src="/doge-logo-transparent.png" alt="DOGE" width={54} height={54} className="size-14 object-contain" /></Link>
          <span className="font-mono text-xs text-zinc-500">{quote.quote_number}</span>
        </header>
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/30 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">{labels.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-semibold">{labels.hello}, {String(request?.contact_name || (locale === 'en' ? 'client' : 'cliente'))}.</h1>
          <p className="mt-3 text-zinc-300">{labels.intro} {String(request?.service_name_snapshot || (locale === 'en' ? 'the requested service' : 'el servicio solicitado'))}.</p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            {items.map((item: Record<string, unknown>, index: number) => (
              <div key={`${item.description}-${index}`} className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 px-4 py-4 last:border-0">
                <div>
                  <p className="font-medium">{String(item.description)}</p>
                  <p className="mt-1 text-xs text-zinc-500">{Number(item.quantity)} × {money(Number(item.unit_price_cents), String(quote.currency))}</p>
                </div>
                <p className="font-mono text-sm">{money(Number(item.total_cents), String(quote.currency))}</p>
              </div>
            ))}
          </div>

          <dl className="ml-auto mt-6 max-w-sm space-y-2 text-sm">
            <div className="flex justify-between text-zinc-400"><dt>{labels.subtotal}</dt><dd>{money(Number(quote.subtotal_cents), String(quote.currency))}</dd></div>
            {Number(quote.discount_cents) > 0 && <div className="flex justify-between text-zinc-400"><dt>{labels.discount}</dt><dd>−{money(Number(quote.discount_cents), String(quote.currency))}</dd></div>}
            {Number(quote.tax_cents) > 0 && <div className="flex justify-between text-zinc-400"><dt>{labels.taxes}</dt><dd>{money(Number(quote.tax_cents), String(quote.currency))}</dd></div>}
            <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-semibold"><dt>{labels.total}</dt><dd>{money(Number(quote.total_cents), String(quote.currency))}</dd></div>
          </dl>

          {quote.notes && <p className="mt-7 rounded-xl bg-white/5 p-4 text-sm leading-6 text-zinc-300">{String(quote.notes)}</p>}
          <p className="mt-7 text-xs text-zinc-500">{labels.valid} {new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-US', { dateStyle: 'long' }).format(new Date(String(quote.expires_at)))}. {labels.note}</p>
          <div className="mt-7"><QuoteDecision token={token} locale={locale} /></div>
        </div>
      </section>
    </main>
  );
}
