'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AlertTriangle, Boxes, LoaderCircle, PackagePlus } from 'lucide-react';

import { db } from '@/lib/db';
import type { InventoryRow } from '@/lib/types';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const result = await db.inventory.getAll();
    if (result.data) {
      setInventory(result.data);
      setSelected((current) => result.data?.find((row) => row.product_id === current?.product_id) || result.data?.[0] || null);
    }
    setError(result.error?.message || '');
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function adjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const delta = Number(form.get('delta'));
    const result = await db.inventory.adjust({
      productId: selected.product_id,
      delta,
      movementType: delta > 0 ? 'receipt' : 'adjustment',
      note: String(form.get('note') || ''),
    });
    if (result.error) setError(result.error.message);
    else event.currentTarget.reset();
    await load();
    setBusy(false);
  }

  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-20">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Almacén central</p><h1 className="mt-2 text-3xl font-semibold text-white">Inventario</h1><p className="mt-2 text-sm text-zinc-400">Cada cambio crea un movimiento inmutable; el saldo no se edita directamente.</p></div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-white/10 px-5 py-3 text-xs uppercase tracking-wide text-zinc-600"><span>Producto</span><span>Saldo</span><span>Estado</span></div>
          {inventory.length ? inventory.map((row) => {
            const low = row.on_hand <= Number(row.product?.low_stock_threshold || 0);
            return (
              <button key={row.product_id} onClick={() => setSelected(row)} className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-white/10 px-5 py-4 text-left last:border-0 ${selected?.product_id === row.product_id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}`}>
                <div><p className="font-medium text-white">{row.product?.name || 'Producto'}</p><p className="mt-1 font-mono text-xs text-zinc-600">{row.product?.slug}</p></div>
                <span className="font-mono text-lg text-white">{row.on_hand}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${low ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>{low && <AlertTriangle className="size-3" />}{low ? 'Bajo' : 'Disponible'}</span>
              </button>
            );
          }) : <div className="py-20 text-center text-sm text-zinc-500"><Boxes className="mx-auto mb-3 size-8" />Añade productos propios para comenzar.</div>}
        </section>
        <form onSubmit={adjust} className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2"><PackagePlus className="size-5 text-red-300" /><h2 className="font-semibold">Registrar movimiento</h2></div>
          <p className="text-sm text-zinc-400">{selected?.product?.name || 'Selecciona un producto'}</p>
          <label className="block text-sm text-zinc-400">Cantidad <span className="text-zinc-600">(usa negativo para salida)</span><input required name="delta" type="number" step="1" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
          <label className="block text-sm text-zinc-400">Motivo<textarea required minLength={3} maxLength={500} name="note" rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
          <button disabled={busy || !selected} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold transition hover:bg-red-600 disabled:opacity-40">{busy && <LoaderCircle className="size-4 animate-spin" />} Guardar movimiento</button>
        </form>
      </div>
    </div>
  );
}
