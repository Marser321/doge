'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, CalendarX, Check, ChevronDown, LoaderCircle, X } from 'lucide-react';

import { db, type AppointmentChange } from '@/lib/db';
import { newYorkLocalToIso } from '@/lib/domain';
import type { Team } from '@/lib/types';

const WINDOW_LABEL = { morning: 'Mañana (8–12)', afternoon: 'Tarde (12–17)', flexible: 'Flexible' } as const;
const WINDOW_START = { morning: '09:00', afternoon: '13:00', flexible: '10:00' } as const;
const KIND_LABEL = { schedule: 'Programar', reschedule: 'Reprogramar', cancel: 'Cancelar' } as const;

function formatInstant(value: string) {
  return new Intl.DateTimeFormat('es-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(value));
}

const fetchInbox = () => Promise.all([db.appointmentChanges.getAll(), db.teams.getAll()]);

type Draft = { teamId: string; start: string; hours: string; note: string };

/**
 * Customer change requests waiting for dispatch. Approving with a slot books
 * it atomically through `resolve_appointment_change`, which reuses the
 * existing team-capacity and shift checks.
 */
export function ChangeRequestsInbox({ onResolved }: { onResolved: () => void }) {
  const [changes, setChanges] = useState<AppointmentChange[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ teamId: '', start: '', hours: '2', note: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const apply = useCallback(([changeResult, teamResult]: Awaited<ReturnType<typeof fetchInbox>>) => {
    if (changeResult.data) setChanges(changeResult.data.filter((change) => change.status === 'pending'));
    if (teamResult.data) setTeams(teamResult.data.filter((team) => team.is_active !== false));
    if (changeResult.error) setError(changeResult.error.message);
  }, []);
  const load = useCallback(() => fetchInbox().then(apply), [apply]);

  useEffect(() => {
    let cancelled = false;
    void fetchInbox().then((result) => { if (!cancelled) apply(result); });
    return () => { cancelled = true; };
  }, [apply]);

  function expand(change: AppointmentChange) {
    setError('');
    setOpen(change.id);
    const window = change.preferred_window ?? 'flexible';
    setDraft({
      teamId: change.appointment?.team_id ?? teams[0]?.id ?? '',
      start: change.preferred_date ? `${change.preferred_date}T${WINDOW_START[window]}` : '',
      hours: '2',
      note: '',
    });
  }

  async function resolve(change: AppointmentChange, decision: 'approved' | 'declined', withSlot: boolean) {
    setBusy(true);
    setError('');
    let payload: Parameters<typeof db.appointmentChanges.resolve>[1] = { decision, note: draft.note.trim() || undefined };
    if (decision === 'declined' && !payload.note) {
      setError('Indicá el motivo del rechazo para avisarle al cliente.');
      setBusy(false);
      return;
    }
    if (withSlot) {
      try {
        const startsAt = newYorkLocalToIso(draft.start);
        const endsAt = new Date(new Date(startsAt).getTime() + Number(draft.hours) * 3_600_000).toISOString();
        payload = { ...payload, teamId: draft.teamId, startsAt, endsAt };
      } catch {
        setError('Elegí una fecha y hora válidas.');
        setBusy(false);
        return;
      }
    }
    const result = await db.appointmentChanges.resolve(change.id, payload);
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    setOpen(null);
    await load();
    onResolved();
  }

  if (!changes.length) return null;

  const input = 'w-full rounded-lg border border-subtle bg-surface-2 px-3 py-2 text-xs text-primary outline-none focus:border-red-400';

  return (
    <section className="rounded-3xl border border-amber-400/25 bg-amber-400/[0.06] p-5">
      <button type="button" onClick={() => setCollapsed((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-amber-400/20 font-mono text-xs font-bold text-amber-200">{changes.length}</span>
          <span>
            <span className="block text-sm font-bold text-primary">Cambios solicitados por clientes</span>
            <span className="block text-xs text-secondary">Confirmá el horario o rechazá con un motivo. El cliente recibe un email.</span>
          </span>
        </span>
        <ChevronDown className={`size-4 text-secondary transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {!collapsed && (
        <ul className="mt-4 space-y-2.5">
          {changes.map((change) => {
            const isOpen = open === change.id;
            const Icon = change.kind === 'cancel' ? CalendarX : CalendarClock;
            return (
              <li key={change.id} className="rounded-2xl border border-subtle bg-surface-1 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <Icon className="size-4 text-amber-300" /> {KIND_LABEL[change.kind]} · {change.client?.name ?? 'Cliente'}
                    </p>
                    <p className="mt-1 text-xs text-secondary">
                      <span className="font-mono">{change.service_request?.reference_code}</span> · {change.service_request?.service_name_snapshot}
                      {change.service_request?.property ? ` · ${change.service_request.property.address}` : ''}
                    </p>
                    <p className="mt-2 text-xs text-secondary">
                      {change.appointment && <>Actual: <strong className="text-primary">{formatInstant(change.appointment.starts_at)}</strong> · </>}
                      {change.kind !== 'cancel' && change.preferred_date && (
                        <>Pide: <strong className="text-primary">{change.preferred_date}</strong> ({WINDOW_LABEL[change.preferred_window ?? 'flexible']})</>
                      )}
                    </p>
                    {change.reason && <p className="mt-1.5 text-xs italic text-secondary">“{change.reason}”</p>}
                  </div>
                  {!isOpen && (
                    <button type="button" onClick={() => expand(change)} className="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-black hover:opacity-90">
                      Resolver
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-3 border-t border-subtle pt-4">
                    {change.kind !== 'cancel' && (
                      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_90px]">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          Equipo
                          <select className={`${input} mt-1`} value={draft.teamId} onChange={(e) => setDraft({ ...draft, teamId: e.target.value })}>
                            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                          </select>
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          Inicio (Miami)
                          <input type="datetime-local" className={`${input} mt-1`} value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })} />
                        </label>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                          Horas
                          <input type="number" min="0.5" max="12" step="0.5" className={`${input} mt-1`} value={draft.hours} onChange={(e) => setDraft({ ...draft, hours: e.target.value })} />
                        </label>
                      </div>
                    )}
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                      Nota para el cliente
                      <input className={`${input} mt-1`} value={draft.note} maxLength={1000} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Opcional al aprobar, obligatoria al rechazar" />
                    </label>
                    {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">{error}</p>}
                    <div className="flex flex-wrap gap-2">
                      {change.kind === 'cancel' ? (
                        <button type="button" disabled={busy} onClick={() => void resolve(change, 'approved', false)} className="inline-flex items-center gap-1.5 rounded-xl bg-red-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50">
                          {busy ? <LoaderCircle data-motion="progress" className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Aprobar cancelación
                        </button>
                      ) : (
                        <>
                          <button type="button" disabled={busy || !draft.teamId || !draft.start} onClick={() => void resolve(change, 'approved', true)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-black hover:opacity-90 disabled:opacity-50">
                            {busy ? <LoaderCircle data-motion="progress" className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Aprobar y agendar
                          </button>
                          <button type="button" disabled={busy} onClick={() => void resolve(change, 'approved', false)} className="rounded-xl border border-subtle px-3.5 py-2 text-xs font-semibold text-secondary hover:text-primary disabled:opacity-50">
                            Aprobar sin horario
                          </button>
                        </>
                      )}
                      <button type="button" disabled={busy} onClick={() => void resolve(change, 'declined', false)} className="rounded-xl border border-red-400/30 px-3.5 py-2 text-xs font-semibold text-tone-danger hover:bg-red-500/10 disabled:opacity-50">
                        Rechazar
                      </button>
                      <button type="button" onClick={() => setOpen(null)} className="ml-auto rounded-xl p-2 text-secondary hover:text-primary" aria-label="Cerrar">
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
