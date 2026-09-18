'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, CheckCircle2, Clock3, Filter, LoaderCircle, Pencil, Plus, Users, X } from 'lucide-react';

import { db } from '@/lib/db';
import { newYorkDate, newYorkLocalToIso } from '@/lib/domain';
import type { Appointment, ServiceRequest, Team } from '@/lib/types';
import { CrmEmptyState, CrmPageIntro, CrmStatusPill } from '@/components/admin/CrmPrimitives';

function appointmentTone(status: Appointment['status']) {
  if (status === 'completed') return 'success' as const;
  if (status === 'cancelled') return 'danger' as const;
  if (status === 'scheduled') return 'info' as const;
  return 'warning' as const;
}

function appointmentLabel(status: Appointment['status']) {
  if (status === 'completed') return 'Completada';
  if (status === 'cancelled') return 'Cancelada';
  if (status === 'scheduled') return 'Programada';
  if (status === 'in_progress') return 'En curso';
  return status;
}

function newYorkInput(value: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:${part('minute')}`;
}

function CalendarContent() {
  const searchParams = useSearchParams();
  const initialRequestId = searchParams.get('request') || '';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState(initialRequestId);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all');

  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);

  async function load() {
    const [appointmentResult, requestResult, teamResult] = await Promise.all([
      db.appointments.getAll(),
      db.requests.getAll(),
      db.teams.getAll(),
    ]);
    if (appointmentResult.data) setAppointments(appointmentResult.data);
    if (requestResult.data) setRequests(requestResult.data.filter((item) => ['approved', 'scheduled'].includes(item.status)));
    if (teamResult.data) setTeams(teamResult.data);
    setError(appointmentResult.error?.message || requestResult.error?.message || teamResult.error?.message || '');
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Update selectedRequestId if query param arrives or changes
  useEffect(() => {
    if (initialRequestId) {
      setSelectedRequestId(initialRequestId);
    }
  }, [initialRequestId]);

  const handleStartsAtChange = (value: string) => {
    setStartsAt(value);
    // Automatically set endsAt to startsAt + 2 hours if endsAt is not set
    if (value && !endsAt) {
      const dt = new Date(value);
      dt.setHours(dt.getHours() + 2);
      const isoLocal = dt.toISOString().slice(0, 16);
      setEndsAt(isoLocal);
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (selectedTeamFilter !== 'all' && appointment.team_id !== selectedTeamFilter) return false;
      if (statusFilter !== 'all' && appointment.status !== statusFilter) return false;
      return true;
    });
  }, [appointments, selectedTeamFilter, statusFilter]);

  const grouped = useMemo(() => {
    const result = new Map<string, Appointment[]>();
    filteredAppointments.forEach((appointment) => {
      const key = newYorkDate(appointment.starts_at);
      result.set(key, [...(result.get(key) || []), appointment]);
    });
    return [...result.entries()];
  }, [filteredAppointments]);

  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSuccessMessage('');
    const form = new FormData(event.currentTarget);
    const result = await db.appointments.create({
      requestId: String(form.get('requestId')),
      teamId: String(form.get('teamId')),
      startsAt: newYorkLocalToIso(String(form.get('startsAt'))),
      endsAt: newYorkLocalToIso(String(form.get('endsAt'))),
      notes: String(form.get('notes') || ''),
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccessMessage('Visita programada con éxito en la agenda.');
      setStartsAt('');
      setEndsAt('');
      setSelectedRequestId('');
      (event.currentTarget as HTMLFormElement).reset();
      setTimeout(() => setSuccessMessage(''), 4500);
    }
    await load();
    setBusy(false);
  }

  async function reschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rescheduling) return;
    setBusy(true);
    setError('');
    setSuccessMessage('');
    const form = new FormData(event.currentTarget);
    const result = await db.appointments.reschedule(rescheduling.id, {
      teamId: String(form.get('teamId')),
      startsAt: newYorkLocalToIso(String(form.get('startsAt'))),
      endsAt: newYorkLocalToIso(String(form.get('endsAt'))),
      notes: String(form.get('notes') || ''),
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      setSuccessMessage('Horario reprogramado exitosamente.');
      setRescheduling(null);
      setTimeout(() => setSuccessMessage(''), 4500);
    }
    await load();
    setBusy(false);
  }

  if (loading) {
    return (
      <div className="grid min-h-96 place-items-center">
        <LoaderCircle className="size-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-20">
      <CrmPageIntro
        eyebrow="Operación · despacho"
        title="Agenda operativa"
        description="Gestión integral de cuadrillas y visitas técnicas. La base de datos garantiza la no duplicidad de citas."
      />

      {error && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 animate-in fade-in">
          {error}
        </p>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-zinc-500" />
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="all">Todos los equipos ({teams.length})</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.capacity_size} personas)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${statusFilter === 'all' ? 'bg-white text-zinc-900 font-semibold' : 'border border-white/10 text-zinc-400 hover:bg-white/5'}`}
          >
            Todas ({appointments.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('scheduled')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${statusFilter === 'scheduled' ? 'bg-sky-600 text-white font-semibold' : 'border border-sky-500/20 text-sky-300 hover:bg-sky-500/10'}`}
          >
            Programadas
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('in_progress')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${statusFilter === 'in_progress' ? 'bg-amber-600 text-white font-semibold' : 'border border-amber-500/20 text-amber-300 hover:bg-amber-500/10'}`}
          >
            En curso
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('completed')}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${statusFilter === 'completed' ? 'bg-emerald-600 text-white font-semibold' : 'border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10'}`}
          >
            Completadas
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Appointments List */}
        <section className="space-y-4">
          {grouped.length ? (
            grouped.map(([date, items]) => (
              <div key={date} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] shadow-xl">
                <h2 className="border-b border-white/10 px-5 py-3 text-sm font-semibold capitalize text-zinc-300 bg-white/[0.02]">
                  {new Intl.DateTimeFormat('es-US', { dateStyle: 'full', timeZone: 'America/New_York' }).format(
                    new Date(`${date}T12:00:00-04:00`)
                  )}
                </h2>
                <div className="divide-y divide-white/10">
                  {items.map((appointment) => (
                    <article key={appointment.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[130px_1fr_auto_auto] sm:items-center">
                      <p className="flex items-center gap-2 font-mono text-sm text-zinc-300">
                        <Clock3 className="size-4 text-zinc-500" />
                        {new Intl.DateTimeFormat('es-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZone: 'America/New_York',
                        }).format(new Date(appointment.starts_at))}
                      </p>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">
                          {appointment.service_request?.service_name_snapshot || 'Servicio DOGE'}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400 truncate">
                          {appointment.property?.address} · <span className="text-zinc-300 font-medium">{appointment.team?.name}</span>
                        </p>
                        {appointment.notes && (
                          <p className="mt-1 text-[11px] text-zinc-500 italic truncate">
                            Nota: {appointment.notes}
                          </p>
                        )}
                      </div>
                      <CrmStatusPill tone={appointmentTone(appointment.status)}>
                        {appointmentLabel(appointment.status)}
                      </CrmStatusPill>
                      {appointment.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => setRescheduling(appointment)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 transition"
                        >
                          <Pencil className="size-3 text-zinc-400" /> Reprogramar
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10">
              <CrmEmptyState
                icon={CalendarDays}
                title="No hay citas que coincidan"
                detail="Al aprobar solicitudes de clientes, podrás asignarlas y programarlas para una cuadrilla desde este panel."
              />
            </div>
          )}
        </section>

        {/* Schedule Form */}
        <form onSubmit={schedule} className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg lg:sticky lg:top-24">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Plus className="size-5 text-red-400" />
            <h2 className="font-bold text-white text-base">Programar visita</h2>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Solicitud de cliente aprobada *
            <select
              required
              name="requestId"
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-red-500/50 focus:outline-none"
            >
              <option value="" disabled>Selecciona una solicitud</option>
              {requests.map((request) => (
                <option key={request.id} value={request.id}>
                  {request.reference_code} · {request.contact_name} ({request.service_name_snapshot || 'Servicio'})
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Equipo de cuadrilla *
            <select
              required
              name="teamId"
              defaultValue=""
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-red-500/50 focus:outline-none"
            >
              <option value="" disabled>Selecciona un equipo asignado</option>
              {teams.filter((team) => team.is_active).map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} · {team.capacity_size} personas
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Inicio *
              <input
                required
                name="startsAt"
                type="datetime-local"
                value={startsAt}
                onChange={(e) => handleStartsAtChange(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500/50 focus:outline-none"
              />
            </label>

            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Final estimada *
              <input
                required
                name="endsAt"
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white focus:border-red-500/50 focus:outline-none"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Instrucciones para la cuadrilla
            <textarea
              name="notes"
              rows={3}
              placeholder="Ej. Ingreso por portón lateral, cliente solicita atención especial en ventanales altos..."
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-500/50 focus:outline-none resize-none"
            />
          </label>

          <button
            disabled={busy || !requests.length || !teams.length}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold text-white transition hover:bg-red-600 active:scale-[0.99] disabled:opacity-40"
          >
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Plus className="size-4" />}
            {busy ? 'Programando...' : 'Confirmar visita'}
          </button>
        </form>
      </div>

      {/* Reschedule Modal */}
      {rescheduling && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={reschedule} className="w-full max-w-lg space-y-4 rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-red-400 font-michroma">Agenda operativa</p>
                <h2 className="mt-1 text-xl font-bold text-white">Reprogramar visita</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {rescheduling.service_request?.service_name_snapshot || 'Servicio DOGE'} · {rescheduling.property?.address}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduling(null)}
                aria-label="Cerrar modal"
                className="rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Equipo de cuadrilla
              <select
                required
                name="teamId"
                defaultValue={rescheduling.team_id}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white focus:border-red-500/50 focus:outline-none"
              >
                {teams.filter((team) => team.is_active).map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.capacity_size} personas)
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Inicio
                <input
                  required
                  name="startsAt"
                  type="datetime-local"
                  defaultValue={newYorkInput(rescheduling.starts_at)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-500/50 focus:outline-none"
                />
              </label>
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Final
                <input
                  required
                  name="endsAt"
                  type="datetime-local"
                  defaultValue={newYorkInput(rescheduling.ends_at)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white focus:border-red-500/50 focus:outline-none"
                />
              </label>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Notas de reprogramación
              <textarea
                name="notes"
                rows={3}
                defaultValue={rescheduling.notes || ''}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-500/50 focus:outline-none resize-none"
              />
            </label>

            <button
              disabled={busy}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Clock3 className="size-4" />}
              {busy ? 'Guardando...' : 'Guardar nuevo horario'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-96 place-items-center">
          <LoaderCircle className="size-6 animate-spin text-zinc-500" />
        </div>
      }
    >
      <CalendarContent />
    </Suspense>
  );
}
