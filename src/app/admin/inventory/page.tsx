'use client';

import { FormEvent, useEffect, useState, useTransition } from 'react';
import { AlertTriangle, Boxes, CheckCircle2, ExternalLink, LoaderCircle, PackagePlus, Plus, Minus, Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { db } from '@/lib/db';
import type { InventoryRow } from '@/lib/types';
import { CrmEmptyState, CrmPageIntro, CrmStatusPill } from '@/components/admin/CrmPrimitives';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [selected, setSelected] = useState<InventoryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'available'>('all');
  const [deltaValue, setDeltaValue] = useState<string>('');

  async function load() {
    const result = await db.inventory.getAll();
    if (result.data) {
      setInventory(result.data);
      setSelected((current) => result.data?.find((row) => row.product_id === current?.product_id) || result.data?.[0] || null);
    }
    setError(result.error?.message || '');
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function adjust(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError('');
    setSuccessMessage('');
    const form = new FormData(event.currentTarget);
    const delta = Number(form.get('delta'));
    const note = String(form.get('note') || '');

    const result = await db.inventory.adjust({
      productId: selected.product_id,
      delta,
      movementType: delta > 0 ? 'receipt' : 'adjustment',
      note,
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccessMessage(`Movimiento de ${delta > 0 ? `+${delta}` : delta} unidades guardado para ${selected.product?.name || 'producto'}.`);
      setDeltaValue('');
      (event.currentTarget as HTMLFormElement).reset();
      setTimeout(() => setSuccessMessage(''), 4500);
    }
    await load();
    setBusy(false);
  }

  const filteredInventory = inventory.filter((row) => {
    const query = search.trim().toLowerCase();
    const nameMatch = (row.product?.name || '').toLowerCase().includes(query);
    const slugMatch = (row.product?.slug || '').toLowerCase().includes(query);
    const matchesSearch = query === '' || nameMatch || slugMatch;

    const isLow = row.on_hand <= Number(row.product?.low_stock_threshold || 0);
    if (!matchesSearch) return false;
    if (filter === 'low') return isLow;
    if (filter === 'available') return !isLow;
    return true;
  });

  const lowStockCount = inventory.filter((row) => row.on_hand <= Number(row.product?.low_stock_threshold || 0)).length;

  if (loading) {
    return (
      <div className="grid min-h-96 place-items-center">
        <LoaderCircle data-motion="progress" className="size-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-20">
      <CrmPageIntro
        eyebrow="Almacén central · DOGE"
        title="Control de inventario"
        description="Registro auditado de existencias. Cada ajuste genera un movimiento contable inmutable para trazabilidad absoluta."
      />

      {error && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 animate-in fade-in">
          {error}
        </p>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-tone-success/10 px-4 py-3 text-sm text-tone-success animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Quick Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted" />
          <input
            type="text"
            placeholder="Buscar por producto o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-subtle bg-surface-0/80 pl-10 pr-4 py-2 text-sm text-primary placeholder-zinc-500 focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/30"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs sm:pb-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-2 font-medium transition ${filter === 'all' ? 'bg-foreground text-background font-semibold' : 'border border-subtle text-secondary hover:bg-surface-2'}`}
          >
            Todos ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('low')}
            className={`flex items-center gap-1 rounded-lg px-3 py-2 font-medium transition ${filter === 'low' ? 'bg-orange-500 text-white font-semibold' : 'border border-tone-warning/25 text-tone-warning hover:bg-tone-warning/10'}`}
          >
            <AlertTriangle className="size-3" />
            Stock bajo ({lowStockCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('available')}
            className={`rounded-lg px-3 py-2 font-medium transition ${filter === 'available' ? 'bg-emerald-600 text-white font-semibold' : 'border border-emerald-500/20 text-emerald-400 hover:bg-tone-success/10'}`}
          >
            Disponible ({inventory.length - lowStockCount})
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Inventory List */}
        <section className="overflow-hidden rounded-2xl border border-subtle bg-surface-1 shadow-xl">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-subtle px-5 py-3 text-xs uppercase tracking-wide text-secondary font-michroma">
            <span>Producto</span>
            <span className="text-right">Saldo</span>
            <span>Estado</span>
          </div>

          {filteredInventory.length ? (
            filteredInventory.map((row) => {
              const threshold = Number(row.product?.low_stock_threshold || 0);
              const low = row.on_hand <= threshold;
              const isCurrent = selected?.product_id === row.product_id;

              return (
                <button
                  key={row.product_id}
                  onClick={() => {
                    setSelected(row);
                    setError('');
                  }}
                  className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-subtle px-5 py-4 text-left transition last:border-0 ${
                    isCurrent ? 'bg-white/[0.08] ring-1 ring-inset ring-white/20' : 'hover:bg-surface-1'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-primary truncate">{row.product?.name || 'Producto'}</p>
                    <div className="mt-1 flex items-center gap-2 font-mono text-xs text-secondary">
                      <span className="truncate">{row.product?.slug}</span>
                      <span className="text-muted">·</span>
                      <span>Mín: {threshold}</span>
                    </div>
                  </div>
                  <span className={`font-mono text-lg font-bold text-right ${low ? 'text-tone-warning' : 'text-primary'}`}>
                    {row.on_hand}
                  </span>
                  <CrmStatusPill tone={low ? 'warning' : 'success'}>
                    {low && <AlertTriangle className="mr-1 size-3 shrink-0" />}
                    {low ? 'Bajo' : 'Óptimo'}
                  </CrmStatusPill>
                </button>
              );
            })
          ) : (
            <CrmEmptyState
              icon={Boxes}
              title={search ? 'No se encontraron resultados' : 'No hay productos de almacén propio'}
              detail={search ? 'Prueba con otro término de búsqueda o limpia el filtro.' : 'Los productos con tipo de venta "Stock propio" aparecerán aquí con su saldo y alertas.'}
            />
          )}
        </section>

        {/* Adjust Stock Form & Selected Card */}
        <div className="space-y-4 lg:sticky lg:top-24 h-fit">
          {selected && (
            <div className="rounded-2xl border border-subtle bg-surface-1 p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3 border-b border-subtle pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tone-danger font-michroma">Producto seleccionado</span>
                  <h3 className="font-bold text-primary text-base mt-0.5">{selected.product?.name}</h3>
                  <p className="font-mono text-xs text-muted mt-0.5">{selected.product?.slug}</p>
                </div>
                <Link
                  href={`/admin/products/${selected.product_id}`}
                  className="p-2 rounded-xl border border-subtle text-secondary hover:text-primary hover:bg-surface-2 transition"
                  title="Ver ficha técnica de producto"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-subtle bg-surface-0/50 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted font-bold">Existencias</span>
                  <p className="mt-1 font-mono text-2xl font-bold text-primary">{selected.on_hand}</p>
                </div>
                <div className="rounded-xl border border-subtle bg-surface-0/50 p-3">
                  <span className="text-[10px] uppercase tracking-wider text-muted font-bold">Umbral mínimo</span>
                  <p className="mt-1 font-mono text-2xl font-bold text-secondary">{selected.product?.low_stock_threshold ?? 0}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={adjust} className="space-y-4 rounded-2xl border border-subtle bg-surface-1 p-5 shadow-lg">
            <div className="flex items-center gap-2">
              <PackagePlus className="size-5 text-tone-danger" />
              <h2 className="font-bold text-primary">Registrar movimiento</h2>
            </div>
            <p className="text-xs text-secondary">
              {selected ? `Ajustando stock para ${selected.product?.name}` : 'Selecciona un producto del listado'}
            </p>

            {/* Quick Adjust Buttons */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-secondary mb-1.5">
                Accesos directos rápidos
              </label>
              <div className="grid grid-cols-6 gap-1">
                {[-10, -5, -1, 1, 5, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDeltaValue(String(val))}
                    className="rounded-lg border border-subtle bg-surface-2 py-1.5 text-xs font-mono font-bold text-secondary hover:bg-surface-3 transition"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-secondary">
              Cantidad neta <span className="text-muted lowercase">(positivo: entrada, negativo: salida)</span>
              <input
                required
                name="delta"
                type="number"
                step="1"
                placeholder="Ej. +10 o -2"
                value={deltaValue}
                onChange={(e) => setDeltaValue(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-subtle bg-surface-0 px-3.5 py-2.5 text-primary font-mono focus:border-red-500/50 focus:outline-none"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-secondary">
              Motivo auditado <span className="text-muted lowercase">(mínimo 3 caracteres)</span>
              <textarea
                required
                minLength={3}
                maxLength={500}
                name="note"
                rows={3}
                placeholder="Ej. Recepción de lote #32, reposición para equipo Alfa, ajuste por merma..."
                className="mt-1.5 w-full rounded-xl border border-subtle bg-surface-0 px-3.5 py-2.5 text-sm text-primary placeholder-zinc-600 focus:border-red-500/50 focus:outline-none resize-none"
              />
            </label>

            <button
              disabled={busy || !selected}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold text-white transition hover:bg-red-600 active:scale-[0.99] disabled:opacity-40"
            >
              {busy ? <LoaderCircle data-motion="progress" className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
              {busy ? 'Registrando movimiento...' : 'Guardar movimiento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
