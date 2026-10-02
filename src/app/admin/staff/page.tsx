'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LoaderCircle, MailPlus, ShieldCheck, UserRoundCog } from 'lucide-react';

import { apiRequest } from '@/lib/api-client';
import { db } from '@/lib/db';
import { newYorkLocalToIso } from '@/lib/domain';
import type { CurrentStaffUser, StaffProfile, StaffRole, Team } from '@/lib/types';
import { CrmPageIntro, CrmEmptyState } from '@/components/admin/CrmPrimitives';

const roles: StaffRole[] = ['owner', 'manager', 'dispatcher', 'crew'];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [current, setCurrent] = useState<CurrentStaffUser | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const [staffResult, teamResult, identity] = await Promise.all([
      db.staff.getAll(),
      db.teams.getAll(),
      apiRequest<CurrentStaffUser>('/api/auth/me', { auth: 'required' }).catch(() => null),
    ]);
    if (staffResult.data) setStaff(staffResult.data);
    if (teamResult.data) setTeams(teamResult.data);
    setCurrent(identity);
    setError(staffResult.error?.message || '');
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const form = new FormData(event.currentTarget);
    const result = await db.staff.invite({
      email: String(form.get('email')),
      display_name: String(form.get('display_name')),
      role: String(form.get('role')),
    });
    if (result.error) setError(result.error.message);
    else {
      setMessage('Invitación enviada y perfil operativo creado.');
      event.currentTarget.reset();
    }
    await load();
    setBusy(false);
  }

  async function update(id: string, patch: Record<string, unknown>) {
    setError('');
    const result = await db.staff.update(id, patch);
    if (result.error) setError(result.error.message);
    else await load();
  }

  async function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const result = await db.teams.assign({
      team_id: String(form.get('team_id')),
      profile_id: String(form.get('profile_id')),
      starts_on: String(form.get('starts_on')),
    });
    setError(result.error?.message || '');
    if (!result.error) setMessage('Integrante asignado al equipo.');
    setBusy(false);
  }

  async function createShift(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const result = await db.shifts.create({
      profile_id: String(form.get('profile_id')),
      starts_at: newYorkLocalToIso(String(form.get('starts_at'))),
      ends_at: newYorkLocalToIso(String(form.get('ends_at'))),
      notes: String(form.get('notes') || ''),
    });
    setError(result.error?.message || '');
    if (!result.error) setMessage('Turno operativo creado.');
    setBusy(false);
  }

  async function createTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const result = await db.teams.create({
      name: String(form.get('name')),
      capacity_size: Number(form.get('capacity_size')),
    });
    setError(result.error?.message || '');
    if (!result.error) {
      setMessage('Equipo operativo creado.');
      event.currentTarget.reset();
      await load();
    }
    setBusy(false);
  }

  if (loading) return <div className="grid min-h-96 place-items-center"><LoaderCircle data-motion="progress" className="size-6 animate-spin text-muted" /></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-20">
      <CrmPageIntro eyebrow="Administración · acceso interno" title="Equipo y roles" description="Las cuentas se crean exclusivamente por invitación y los privilegios se verifican en servidor." />
      {error && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      {message && <p className="rounded-xl border border-tone-success/30 bg-tone-success/10 px-4 py-3 text-sm text-tone-success">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="overflow-hidden rounded-2xl border border-subtle bg-surface-1">
          {staff.length === 0 && (
            <CrmEmptyState
              icon={UserRoundCog}
              title="Todavía no hay personal cargado"
              detail="Invitá al primer miembro del equipo desde el formulario de la derecha."
            />
          )}
          {staff.map((profile) => (
            <article key={profile.id} className="grid gap-4 border-b border-subtle px-5 py-4 last:border-0 md:grid-cols-[1fr_160px_100px] md:items-center">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-surface-3"><UserRoundCog className="size-4 text-secondary" /></div>
                <div><p className="font-medium text-primary">{profile.display_name || 'Sin nombre'}</p><p className="mt-1 text-xs text-muted">{profile.email}</p></div>
              </div>
              <select disabled={current?.role !== 'owner' || profile.id === current?.id} aria-label={`Rol de ${profile.email}`} value={profile.role} onChange={(event) => update(profile.id, { role: event.target.value })} className="rounded-xl border border-subtle bg-surface-0 px-3 py-2 text-sm text-primary disabled:opacity-50">
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
              <button disabled={current?.role !== 'owner' || profile.id === current?.id} onClick={() => update(profile.id, { is_active: !profile.is_active })} className={`rounded-xl border px-3 py-2 text-xs transition disabled:opacity-40 ${profile.is_active ? 'border-tone-success/25 text-tone-success' : 'border-tone-danger/25 text-tone-danger'}`}>{profile.is_active ? 'Activo' : 'Inactivo'}</button>
            </article>
          ))}
        </section>
        <form onSubmit={invite} className="h-fit space-y-4 rounded-2xl border border-subtle bg-surface-1 p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2"><MailPlus className="size-5 text-tone-danger" /><h2 className="font-semibold">Invitar personal</h2></div>
          {current?.role !== 'owner' && <p className="rounded-xl bg-tone-warning/10 p-3 text-xs text-tone-warning">Solo el owner puede enviar invitaciones.</p>}
          <label className="block text-sm text-secondary">Nombre<input required name="display_name" maxLength={120} className="mt-2 w-full rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-primary" /></label>
          <label className="block text-sm text-secondary">Email<input required name="email" type="email" maxLength={254} className="mt-2 w-full rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-primary" /></label>
          <label className="block text-sm text-secondary">Rol<select required name="role" defaultValue="crew" className="mt-2 w-full rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-primary">{roles.filter((role) => role !== 'owner').map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
          <button disabled={busy || current?.role !== 'owner'} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold transition hover:bg-red-600 disabled:opacity-40">{busy ? <LoaderCircle data-motion="progress" className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Enviar invitación</button>
        </form>
      </div>
      <section className="grid gap-6 rounded-2xl border border-subtle bg-surface-1 p-5 lg:grid-cols-2">
        <form onSubmit={createTeam} className="space-y-4 lg:col-span-2">
          <div><h2 className="font-semibold text-primary">Equipos operativos</h2><p className="mt-1 text-xs text-muted">Crea una unidad antes de asignar integrantes y turnos.</p></div>
          <div className="grid gap-3 sm:grid-cols-[1fr_130px_auto]"><input required name="name" placeholder="Equipo Miami 02" className="rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary" /><input required aria-label="Capacidad" name="capacity_size" type="number" min="1" max="20" placeholder="Capacidad" className="rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary" /><button disabled={busy || current?.role === 'dispatcher'} className="rounded-xl border border-strong px-5 text-sm font-semibold disabled:opacity-40">Crear equipo</button></div>
          {teams.length > 0 && <p className="text-xs text-muted">Activos: {teams.map((team) => `${team.name} (${team.capacity_size})`).join(' · ')}</p>}
        </form>
        <form onSubmit={assign} className="space-y-4">
          <div><h2 className="font-semibold text-primary">Asignar a cuadrilla</h2><p className="mt-1 text-xs text-muted">La membresía determina qué trabajos puede ver cada usuario crew.</p></div>
          <select required name="profile_id" defaultValue="" className="w-full rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary"><option value="">Selecciona integrante</option>{staff.filter((profile) => profile.role === 'crew' && profile.is_active).map((profile) => <option key={profile.id} value={profile.id}>{profile.display_name || profile.email}</option>)}</select>
          <select required name="team_id" defaultValue="" className="w-full rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary"><option value="">Selecciona equipo</option>{teams.filter((team) => team.is_active).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select>
          <input required name="starts_on" type="date" className="w-full rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary" />
          <button disabled={busy || current?.role === 'dispatcher'} className="min-h-11 w-full rounded-xl border border-strong text-sm font-semibold disabled:opacity-40">Guardar asignación</button>
        </form>
        <form onSubmit={createShift} className="space-y-4">
          <div><h2 className="font-semibold text-primary">Crear turno</h2><p className="mt-1 text-xs text-muted">La agenda solo ofrece equipos con integrantes de turno durante toda la visita.</p></div>
          <select required name="profile_id" defaultValue="" className="w-full rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary"><option value="">Selecciona integrante</option>{staff.filter((profile) => profile.role === 'crew' && profile.is_active).map((profile) => <option key={profile.id} value={profile.id}>{profile.display_name || profile.email}</option>)}</select>
          <div className="grid gap-3 sm:grid-cols-2"><input required aria-label="Inicio de turno" name="starts_at" type="datetime-local" className="rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary" /><input required aria-label="Final de turno" name="ends_at" type="datetime-local" className="rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary" /></div>
          <input name="notes" placeholder="Notas opcionales" className="w-full rounded-xl border border-subtle bg-surface-0 px-3 py-3 text-sm text-primary" />
          <button disabled={busy} className="min-h-11 w-full rounded-xl border border-strong text-sm font-semibold disabled:opacity-40">Guardar turno</button>
        </form>
      </section>
    </div>
  );
}
