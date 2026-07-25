'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock3, LoaderCircle, Pencil, Plus, X } from 'lucide-react';

import { db } from '@/lib/db';
import { newYorkDate, newYorkLocalToIso } from '@/lib/domain';
import type { Appointment, ServiceRequest, Team } from '@/lib/types';

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

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const result = new Map<string, Appointment[]>();
    appointments.forEach((appointment) => {
      const key = newYorkDate(appointment.starts_at);
      result.set(key, [...(result.get(key) || []), appointment]);
    });
    return [...result.entries()];
  }, [appointments]);

  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const result = await db.appointments.create({
      requestId: String(form.get('requestId')),
      teamId: String(form.get('teamId')),
      startsAt: newYorkLocalToIso(String(form.get('startsAt'))),
      endsAt: newYorkLocalToIso(String(form.get('endsAt'))),
      notes: String(form.get('notes') || ''),
    });
    if (result.error) setError(result.error.message);
    else (event.currentTarget as HTMLFormElement).reset();
    await load();
    setBusy(false);
  }

  async function reschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rescheduling) return;
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const result = await db.appointments.reschedule(rescheduling.id, {
      teamId: String(form.get('teamId')),
      startsAt: newYorkLocalToIso(String(form.get('startsAt'))),
      endsAt: newYorkLocalToIso(String(form.get('endsAt'))),
      notes: String(form.get('notes') || ''),
    });
    if (result.error) setError(result.error.message);
    else setRescheduling(null);
    await load();
    setBusy(false);
  }

  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle className="size-6 animate-spin text-zinc-500" /></div>;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-20">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Despacho</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Agenda operativa</h1>
        <p className="mt-2 text-sm text-zinc-400">Supabase impide cruces de equipo incluso ante dos confirmaciones simultáneas.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          {grouped.length ? grouped.map(([date, items]) => (
            <div key={date} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              <h2 className="border-b border-white/10 px-5 py-3 text-sm font-semibold capitalize text-zinc-300">
                {new Intl.DateTimeFormat('es-US', { dateStyle: 'full', timeZone: 'America/New_York' }).format(new Date(`${date}T12:00:00-04:00`))}
              </h2>
              <div className="divide-y divide-white/10">
                {items.map((appointment) => (
                  <article key={appointment.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[120px_1fr_auto_auto] sm:items-center">
                    <p className="flex items-center gap-2 font-mono text-sm text-zinc-300"><Clock3 className="size-4 text-zinc-600" />{new Intl.DateTimeFormat('es-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }).format(new Date(appointment.starts_at))}</p>
                    <div>
                      <p className="font-medium text-white">{appointment.service_request?.service_name_snapshot || 'Servicio DOGE'}</p>
                      <p className="mt-1 text-xs text-zinc-500">{appointment.property?.address} · {appointment.team?.name}</p>
                    </div>
                    <span className="w-fit rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">{appointment.status}</span>
                    {appointment.status === 'scheduled' && <button type="button" onClick={() => setRescheduling(appointment)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-zinc-300 hover:bg-white/5"><Pencil className="size-3" /> Reprogramar</button>}
                  </article>
                ))}
              </div>
            </div>
          )) : <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-sm text-zinc-500"><CalendarDays className="mx-auto mb-3 size-8" />No hay citas programadas.</div>}
        </section>
        <form onSubmit={schedule} className="h-fit space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2"><Plus className="size-5 text-red-300" /><h2 className="font-semibold text-white">Programar visita</h2></div>
          <label className="block text-sm text-zinc-400">Solicitud aprobada
            <select required name="requestId" defaultValue="" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white">
              <option value="" disabled>Selecciona una solicitud</option>
              {requests.map((request) => <option key={request.id} value={request.id}>{request.reference_code} · {request.contact_name}</option>)}
            </select>
          </label>
          <label className="block text-sm text-zinc-400">Equipo
            <select required name="teamId" defaultValue="" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white">
              <option value="" disabled>Selecciona un equipo</option>
              {teams.filter((team) => team.is_active).map((team) => <option key={team.id} value={team.id}>{team.name} · {team.capacity_size} personas</option>)}
            </select>
          </label>
          <label className="block text-sm text-zinc-400">Inicio<input required name="startsAt" type="datetime-local" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
          <label className="block text-sm text-zinc-400">Final<input required name="endsAt" type="datetime-local" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
          <label className="block text-sm text-zinc-400">Notas<textarea name="notes" rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
          <button disabled={busy || !requests.length || !teams.length} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold transition hover:bg-red-600 disabled:opacity-40">{busy && <LoaderCircle className="size-4 animate-spin" />} Confirmar horario</button>
        </form>
      </div>
      {rescheduling && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-4">
          <form onSubmit={reschedule} className="w-full max-w-lg space-y-4 rounded-3xl border border-white/10 bg-zinc-950 p-6">
            <div className="flex items-start justify-between"><div><p className="text-xs uppercase tracking-wide text-red-300">Agenda</p><h2 className="mt-1 text-xl font-semibold">Reprogramar visita</h2></div><button type="button" onClick={() => setRescheduling(null)} aria-label="Cerrar" className="rounded-lg p-2 text-zinc-500"><X className="size-5" /></button></div>
            <label className="block text-sm text-zinc-400">Equipo<select required name="teamId" defaultValue={rescheduling.team_id} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white">{teams.filter((team) => team.is_active).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
            <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-zinc-400">Inicio<input required name="startsAt" type="datetime-local" defaultValue={newYorkInput(rescheduling.starts_at)} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label><label className="text-sm text-zinc-400">Final<input required name="endsAt" type="datetime-local" defaultValue={newYorkInput(rescheduling.ends_at)} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label></div>
            <label className="block text-sm text-zinc-400">Notas<textarea name="notes" rows={3} defaultValue={rescheduling.notes || ''} className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-white" /></label>
            <button disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold disabled:opacity-50">{busy && <LoaderCircle className="size-4 animate-spin" />} Guardar nuevo horario</button>
          </form>
        </div>
      )}
    </div>
  );
}
