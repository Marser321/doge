'use client';

import { useEffect, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';

import { db, type RequestArea } from '@/lib/db';

/**
 * Which of the customer's spaces this visit covers. Completing the request
 * resets exactly these to 100% in the customer panel.
 */
export function RequestAreasEditor({ requestId, locked }: { requestId: string; locked: boolean }) {
  const [areas, setAreas] = useState<RequestArea[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // The parent remounts this per request (key), so there is no stale state to clear.
    let cancelled = false;
    void db.requestAreas.get(requestId).then((result) => {
      if (cancelled) return;
      setAreas(result.data ?? []);
      setSelected(new Set((result.data ?? []).filter((area) => area.linked).map((area) => area.id)));
      if (result.error) setMessage(result.error.message);
    });
    return () => { cancelled = true; };
  }, [requestId]);

  async function save() {
    setBusy(true);
    setMessage('');
    const result = await db.requestAreas.set(requestId, [...selected]);
    setBusy(false);
    setMessage(result.error ? result.error.message : 'Espacios actualizados.');
  }

  if (areas === null) return null;

  return (
    <div className="pt-4 border-t border-subtle space-y-2.5">
      <p className="text-[10px] uppercase font-bold tracking-wider text-muted">Espacios incluidos</p>
      {areas.length === 0 ? (
        <p className="text-xs text-secondary">El cliente no cargó espacios en esta propiedad.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {areas.map((area) => {
              const active = selected.has(area.id);
              return (
                <button
                  key={area.id}
                  type="button"
                  disabled={locked || busy}
                  aria-pressed={active}
                  onClick={() => setSelected((current) => {
                    const next = new Set(current);
                    if (next.has(area.id)) next.delete(area.id); else next.add(area.id);
                    return next;
                  })}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-60 ${
                    active ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-subtle text-secondary hover:text-primary'
                  }`}
                >
                  {active && <Check className="size-3" />} {area.label}
                </button>
              );
            })}
          </div>
          {!locked && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-subtle px-3 py-1.5 text-xs font-semibold text-secondary hover:text-primary disabled:opacity-50"
            >
              {busy && <LoaderCircle data-motion="progress" className="size-3.5 animate-spin" />} Guardar espacios
            </button>
          )}
        </>
      )}
      {message && <p className="text-xs text-secondary">{message}</p>}
    </div>
  );
}
