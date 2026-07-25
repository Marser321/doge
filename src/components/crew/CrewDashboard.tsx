'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, Camera, CheckCircle2, Clock3, LoaderCircle, LogOut, MapPin, PlayCircle } from 'lucide-react';

import { apiRequest } from '@/lib/api-client';
import { getBrowserSupabase } from '@/lib/supabase/client';
import type { Appointment, RequestStatus } from '@/lib/types';

export default function CrewDashboard({ initialAppointments, displayName }: { initialAppointments: Appointment[]; displayName: string }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    setAppointments(await apiRequest<Appointment[]>('/api/crew/appointments', { auth: 'required' }));
  }

  async function transition(appointment: Appointment, status: RequestStatus) {
    setBusy(appointment.id);
    setError('');
    try {
      await apiRequest(`/api/crm/service-requests/${appointment.service_request_id}`, {
        method: 'PATCH',
        body: { status },
        auth: 'required',
      });
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible actualizar el trabajo.');
    } finally {
      setBusy('');
    }
  }

  async function evidence(event: FormEvent<HTMLFormElement>, appointment: Appointment) {
    event.preventDefault();
    setBusy(appointment.id);
    setError('');
    try {
      await apiRequest('/api/crew/evidence', {
        method: 'POST',
        body: new FormData(event.currentTarget),
        auth: 'required',
      });
      event.currentTarget.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar la evidencia.');
    } finally {
      setBusy('');
    }
  }

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    window.location.href = '/login';
  }

  return (
    <main className="min-h-screen bg-[#0b0b0c] pb-16 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b0c]/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3"><Image src="/doge-logo-transparent.png" alt="DOGE" width={42} height={42} className="size-10 object-contain" /><div><p className="text-xs uppercase tracking-wide text-zinc-500">Cuadrilla</p><p className="font-semibold">{displayName}</p></div></div>
          <button onClick={signOut} aria-label="Cerrar sesión" className="rounded-full border border-white/10 p-2 text-zinc-400"><LogOut className="size-4" /></button>
        </div>
      </header>
      <section className="mx-auto max-w-3xl space-y-4 px-4 pt-6">
        <div><h1 className="text-2xl font-semibold">Mis asignaciones</h1><p className="mt-1 text-sm text-zinc-400">Solo se muestran los trabajos de tu equipo.</p></div>
        {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
        {appointments.length ? appointments.map((appointment) => (
          <article key={appointment.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-4">
              <div><p className="font-mono text-xs text-red-300">{appointment.service_request?.reference_code}</p><h2 className="mt-2 text-lg font-semibold">{appointment.service_request?.service_name_snapshot || 'Servicio DOGE'}</h2></div>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">{appointment.status}</span>
            </div>
            <div className="mt-5 space-y-2 text-sm text-zinc-300">
              <p className="flex items-center gap-2"><Clock3 className="size-4 text-zinc-600" />{new Intl.DateTimeFormat('es-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(new Date(appointment.starts_at))}</p>
              <p className="flex items-center gap-2"><MapPin className="size-4 text-zinc-600" />{appointment.property?.address}, {appointment.property?.city}</p>
            </div>
            {appointment.property && 'access_notes' in appointment.property && Boolean(appointment.property.access_notes) && <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-100">{String(appointment.property.access_notes)}</p>}
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {appointment.status === 'scheduled' && <button disabled={busy === appointment.id} onClick={() => transition(appointment, 'in_progress')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold"><PlayCircle className="size-4" /> Iniciar trabajo</button>}
              {appointment.status === 'in_progress' && <button disabled={busy === appointment.id} onClick={() => transition(appointment, 'completed')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 font-semibold"><CheckCircle2 className="size-4" /> Finalizar trabajo</button>}
            </div>
            {['in_progress', 'completed'].includes(appointment.status) && (
              <form onSubmit={(event) => evidence(event, appointment)} className="mt-5 space-y-3 border-t border-white/10 pt-5">
                <input type="hidden" name="appointmentId" value={appointment.id} />
                <label className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">Nota, evidencia o incidencia
                  <select name="kind" className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-sm text-white"><option value="note">Nota operativa</option><option value="after">Resultado</option><option value="before">Antes</option><option value="incident">Incidencia</option></select>
                </label>
                <textarea name="note" maxLength={1000} rows={2} placeholder="Describe el avance o la incidencia" className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-3 text-sm" />
                <input name="photo" type="file" accept="image/*" capture="environment" className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-white" />
                <button disabled={busy === appointment.id} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 font-semibold">{busy === appointment.id ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />} Guardar registro</button>
              </form>
            )}
          </article>
        )) : <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-sm text-zinc-500"><AlertTriangle className="mx-auto mb-3 size-7" />No hay trabajos asignados.</div>}
      </section>
    </main>
  );
}
