'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LoaderCircle, PackageCheck, Plus, ShoppingCart, X } from 'lucide-react';

import { db, type Client, type Offer, type Product } from '@/lib/db';

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  status: 'draft' | 'confirmed' | 'fulfilled' | 'cancelled' | 'refunded';
  payment_status: string;
  total_cents: number;
  created_at: string;
  order_items?: Array<{ id: string; product_name: string; quantity: number }>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [lines, setLines] = useState([{ key: 'line-1', product_id: '', quantity: 1 }]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<boolean | string>(false);
  const [error, setError] = useState('');

  async function load() {
    const [orderResult, clientResult, productResult, offerResult] = await Promise.all([
      db.orders.getAll(),
      db.clients.getAll(),
      db.products.getAll(),
      db.offers.getAll(),
    ]);
    setOrders((orderResult.data || []) as OrderRow[]);
    setClients(clientResult.data || []);
    setProducts(productResult.data || []);
    setOffers(offerResult.data || []);
    setError(orderResult.error?.message || clientResult.error?.message || productResult.error?.message || offerResult.error?.message || '');
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const client = clients.find((item) => item.id === form.get('client_id'));
    const result = await db.orders.create({
      client_id: client?.id || null,
      customer_name: String(form.get('customer_name') || client?.name || ''),
      customer_email: String(form.get('customer_email') || client?.email || ''),
      customer_phone: String(form.get('customer_phone') || client?.phone || ''),
      delivery_address: String(form.get('delivery_address') || client?.address || ''),
      channel: 'concierge',
      status: String(form.get('status')),
      payment_status: String(form.get('payment_status')),
      offer_id: String(form.get('offer_id') || '') || null,
      notes: String(form.get('notes') || ''),
    }, lines.map(({ product_id, quantity }) => ({ product_id, quantity })));
    if (result.error) setError(result.error.message);
    else {
      setShowForm(false);
      setLines([{ key: 'line-1', product_id: '', quantity: 1 }]);
      event.currentTarget.reset();
    }
    await load();
    setBusy(false);
  }

  async function transition(order: OrderRow, status: string) {
    setBusy(order.id);
    const result = await db.orders.updateStatus(order.id, status);
    if (result.error) setError(result.error.message);
    else await load();
    setBusy(false);
  }

  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Venta concierge</p><h1 className="mt-2 text-3xl font-semibold text-white">Órdenes</h1><p className="mt-2 text-sm text-zinc-400">Los precios se leen del catálogo y el inventario se descuenta al confirmar.</p></div>
        <button onClick={() => setShowForm(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-black"><Plus className="size-4" /> Nueva orden</button>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        {orders.length ? <div className="divide-y divide-white/10">{orders.map((order) => (
          <article key={order.id} className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_160px_140px_180px] lg:items-center">
            <div><p className="font-medium text-white">{order.order_number} · {order.customer_name}</p><p className="mt-1 text-xs text-zinc-500">{order.order_items?.map((item) => `${item.quantity}× ${item.product_name}`).join(', ') || 'Sin líneas'}</p></div>
            <p className="font-mono text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(order.total_cents) / 100)}</p>
            <span className="w-fit rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">{order.payment_status}</span>
            <select disabled={busy === order.id || ['cancelled', 'refunded'].includes(order.status)} value={order.status} onChange={(event) => transition(order, event.target.value)} className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-sm text-white disabled:opacity-50">
              <option value={order.status}>{order.status}</option>
              {order.status === 'draft' && <><option value="confirmed">confirmed</option><option value="cancelled">cancelled</option></>}
              {order.status === 'confirmed' && <><option value="fulfilled">fulfilled</option><option value="cancelled">cancelled</option></>}
              {order.status === 'fulfilled' && <option value="refunded">refunded</option>}
            </select>
          </article>
        ))}</div> : <div className="py-20 text-center text-sm text-zinc-500"><ShoppingCart className="mx-auto mb-3 size-8" />Todavía no hay órdenes.</div>}
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <form onSubmit={create} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wide text-red-300">Orden interna</p><h2 className="mt-1 text-xl font-semibold">Venta asistida</h2></div><button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5"><X className="size-5" /></button></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-zinc-400 sm:col-span-2">Cliente registrado<select name="client_id" defaultValue="" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white"><option value="">Venta sin cliente vinculado</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
              <label className="text-sm text-zinc-400">Nombre<input name="customer_name" placeholder="Se completa desde el cliente o como venta concierge" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white" /></label>
              <label className="text-sm text-zinc-400">Email<input name="customer_email" type="email" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white" /></label>
              <label className="text-sm text-zinc-400">Teléfono<input name="customer_phone" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white" /></label>
              <label className="text-sm text-zinc-400">Entrega<input name="delivery_address" className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white" /></label>
              <label className="text-sm text-zinc-400">Estado<select name="status" defaultValue="draft" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white"><option value="draft">Borrador</option><option value="confirmed">Confirmada</option></select></label>
              <label className="text-sm text-zinc-400">Pago<select name="payment_status" defaultValue="unpaid" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white"><option value="unpaid">Pendiente</option><option value="paid">Pagado</option></select></label>
              <label className="text-sm text-zinc-400 sm:col-span-2">Oferta<select name="offer_id" defaultValue="" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white"><option value="">Sin oferta</option>{offers.filter((offer) => offer.status === 'Active' && ['products', 'both'].includes(offer.applies_to)).map((offer) => <option key={offer.id} value={offer.id}>{offer.title} · {offer.code}</option>)}</select></label>
            </div>
            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-white">Productos</p>
              {lines.map((line) => <div key={line.key} className="grid grid-cols-[1fr_90px_auto] gap-3"><select required value={line.product_id} onChange={(event) => setLines((current) => current.map((candidate) => candidate.key === line.key ? { ...candidate, product_id: event.target.value } : candidate))} className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white"><option value="">Selecciona producto</option>{products.filter((product) => product.is_active).map((product) => <option key={product.id} value={product.id}>{product.name} · ${product.price}</option>)}</select><input required type="number" min="1" value={line.quantity} onChange={(event) => setLines((current) => current.map((candidate) => candidate.key === line.key ? { ...candidate, quantity: Number(event.target.value) } : candidate))} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white" /><button type="button" disabled={lines.length === 1} onClick={() => setLines((current) => current.filter((candidate) => candidate.key !== line.key))} className="rounded-xl p-3 text-zinc-500 disabled:opacity-30"><X className="size-4" /></button></div>)}
              <button type="button" onClick={() => setLines((current) => [...current, { key: crypto.randomUUID(), product_id: '', quantity: 1 }])} className="inline-flex items-center gap-2 text-sm text-zinc-300"><Plus className="size-4" /> Añadir producto</button>
            </div>
            <label className="mt-5 block text-sm text-zinc-400">Notas<textarea name="notes" rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white" /></label>
            <button disabled={busy === true || lines.some((line) => !line.product_id)} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold disabled:opacity-40">{busy === true ? <LoaderCircle className="size-4 animate-spin" /> : <PackageCheck className="size-4" />} Crear orden</button>
          </form>
        </div>
      )}
    </div>
  );
}
