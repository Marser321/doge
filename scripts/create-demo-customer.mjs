import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Creates (or rebuilds with --reset) a demo customer that shows every part of
 * the customer panel: spaces at different cleanliness levels, an active
 * membership, a confirmed visit, history, and a pending change request for
 * the admin inbox. It also makes sure the demo team has an active crew member
 * on shift, so "Aprobar y agendar" works end to end.
 *
 * Uso:
 *   node --env-file=.env.local scripts/create-demo-customer.mjs [email] [--reset] [--allow-remote]
 *
 * The password comes from DEMO_CUSTOMER_PASSWORD when set (stable across
 * runs); otherwise a random one is generated and printed once.
 * Nothing is hard-deleted: --reset archives the previous demo records.
 */

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const email = (args.find((arg) => !arg.startsWith('--')) || 'demo.cliente@doge.test').toLowerCase();
const crewEmail = 'demo.cuadrilla@doge.test';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY son requeridos en el entorno.');
  process.exit(1);
}

const host = new URL(url).hostname;
const isLocal = ['localhost', '127.0.0.1', '::1'].includes(host) || host.endsWith('.localhost');
if (!isLocal && !flags.has('--allow-remote')) {
  console.error(`Error: ${host} no es un Supabase local.`);
  console.error('Si es un entorno de staging/demo (nunca producción), repetí con --allow-remote.');
  process.exit(1);
}

const db = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });

// ── Helpers ───────────────────────────────────────────────────────────
function must(result, what) {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data;
}

const DAY = 86_400_000;

/** YYYY-MM-DD in New York, `offsetDays` from today. */
function nyDate(offsetDays = 0) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date(Date.now() + offsetDays * DAY));
}

/** ISO instant for a wall-clock time in New York. */
function nyInstant(date, hour, minute = 0) {
  const desired = Date.UTC(...date.split('-').map((part, index) => Number(part) - (index === 1 ? 1 : 0)), hour, minute);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  let guess = desired;
  for (let i = 0; i < 3; i += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(guess)).map((part) => [part.type, part.value]));
    const shown = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    guess += desired - shown;
  }
  return new Date(guess).toISOString();
}

function reference() {
  return `DOGE-${nyDate().replaceAll('-', '')}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

/** last_cleaned_at that yields `percent` today for a `decayDays` cycle. */
function cleanedAtFor(percent, decayDays) {
  return new Date(Date.now() - ((100 - percent) / 100) * decayDays * DAY).toISOString();
}

async function findAuthUser(target) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === target);
    if (match || data.users.length < 1000) return match ?? null;
  }
  return null;
}

async function ensureAuthUser(target, password, metadata) {
  const created = await db.auth.admin.createUser({ email: target, password, email_confirm: true, user_metadata: metadata });
  if (!created.error) return created.data.user.id;
  const existing = await findAuthUser(target);
  if (!existing) throw created.error;
  must(await db.auth.admin.updateUserById(existing.id, { password, email_confirm: true }), 'Actualizar usuario');
  return existing.id;
}

// ── Crew so dispatch can actually book the demo ───────────────────────
async function ensureCrew(team) {
  const crewId = await ensureAuthUser(crewEmail, randomBytes(18).toString('base64url'), { display_name: 'Cuadrilla Demo' });
  must(await db.from('profiles').upsert({
    id: crewId, email: crewEmail, display_name: 'Cuadrilla Demo', role: 'crew', locale: 'es', is_active: true,
  }), 'Perfil de cuadrilla');

  const membership = must(await db.from('team_members').select('team_id').eq('team_id', team.id).eq('profile_id', crewId).limit(1), 'Equipo');
  if (!membership.length) {
    must(await db.from('team_members').insert({ team_id: team.id, profile_id: crewId, starts_on: nyDate(-1) }), 'Asignar cuadrilla');
  }

  // Weekday shifts 8:00–18:00 for the next three weeks, skipping existing ones.
  const existing = must(await db.from('shifts').select('starts_at').eq('profile_id', crewId).gte('starts_at', new Date().toISOString()), 'Turnos');
  const taken = new Set(existing.map((shift) => new Date(shift.starts_at).toISOString()));
  const rows = [];
  for (let offset = 0; offset <= 21; offset += 1) {
    const date = nyDate(offset);
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    if (weekday === 0) continue;
    const startsAt = nyInstant(date, 8);
    if (!taken.has(startsAt)) rows.push({ profile_id: crewId, starts_at: startsAt, ends_at: nyInstant(date, 18), notes: 'Turno demo' });
  }
  if (rows.length) must(await db.from('shifts').insert(rows), 'Crear turnos');
}

/** First free two-hour slot for the team, starting `offsetDays` from today. */
async function freeSlot(teamId, offsetDays, hour = 10) {
  for (let extra = 0; extra < 14; extra += 1) {
    const date = nyDate(offsetDays + extra);
    if (new Date(`${date}T12:00:00Z`).getUTCDay() === 0) continue;
    const startsAt = nyInstant(date, hour);
    const endsAt = nyInstant(date, hour + 2);
    const clash = must(await db.from('appointments').select('id').eq('team_id', teamId).neq('status', 'cancelled')
      .lt('starts_at', endsAt).gt('ends_at', startsAt).limit(1), 'Disponibilidad');
    if (!clash.length) return { startsAt, endsAt };
  }
  throw new Error('No hay horarios libres para el equipo demo en las próximas dos semanas.');
}

// ── Reset: archive, never delete ──────────────────────────────────────
async function archiveDemo(clientId) {
  const now = new Date().toISOString();
  const requests = must(await db.from('service_requests').select('id').eq('client_id', clientId).is('archived_at', null), 'Solicitudes');
  const requestIds = requests.map((row) => row.id);
  if (requestIds.length) {
    must(await db.from('appointment_change_requests').update({ status: 'withdrawn', resolved_at: now })
      .in('service_request_id', requestIds).eq('status', 'pending'), 'Retirar cambios');
    // Frees the team calendar for the next demo run.
    must(await db.from('appointments').update({ status: 'cancelled', notes: 'Demo reiniciada' })
      .in('service_request_id', requestIds).eq('status', 'scheduled'), 'Cancelar citas');
    must(await db.from('service_requests').update({ archived_at: now }).in('id', requestIds), 'Archivar solicitudes');
  }
  must(await db.from('subscriptions').update({ status: 'cancelled', ended_on: nyDate(), archived_at: now })
    .eq('client_id', clientId).is('archived_at', null), 'Archivar membresías');
  const properties = must(await db.from('properties').select('id').eq('client_id', clientId).is('archived_at', null), 'Propiedades');
  const propertyIds = properties.map((row) => row.id);
  if (propertyIds.length) {
    must(await db.from('property_areas').update({ archived_at: now }).in('property_id', propertyIds).is('archived_at', null), 'Archivar espacios');
    must(await db.from('properties').update({ archived_at: now }).in('id', propertyIds), 'Archivar propiedades');
  }
}

// ── Main ──────────────────────────────────────────────────────────────
async function run() {
  const password = process.env.DEMO_CUSTOMER_PASSWORD || randomBytes(12).toString('base64url');
  console.log(`Preparando cliente demo ${email} en ${host}…`);

  const userId = await ensureAuthUser(email, password, { display_name: 'Cliente Demo' });

  let client = must(await db.from('clients').select('*').eq('auth_user_id', userId).is('archived_at', null).maybeSingle(), 'Cliente');
  if (!client) {
    client = must(await db.from('clients').select('*').eq('email', email).is('archived_at', null).maybeSingle(), 'Cliente');
    if (client) {
      client = must(await db.from('clients').update({ auth_user_id: userId }).eq('id', client.id).select('*').single(), 'Vincular cliente');
    } else {
      client = must(await db.from('clients').insert({
        name: 'Valentina Demo', email, phone: '+1 305 555 0142', locale: 'es', auth_user_id: userId,
        notes: 'Cuenta de demostración del MVP. No contactar.',
      }).select('*').single(), 'Crear cliente');
    }
  }

  const existingProperty = must(await db.from('properties').select('id').eq('client_id', client.id).is('archived_at', null).limit(1), 'Propiedades');
  if (existingProperty.length && !flags.has('--reset')) {
    must(await db.from('client_preferences').upsert({ client_id: client.id, guide_enabled: true, guide_progress: {} }), 'Preferencias');
    printCredentials(password, 'El demo ya existía: solo se actualizó la contraseña y se reinició el tutorial. Usá --reset para reconstruir los datos.');
    return;
  }
  if (flags.has('--reset')) await archiveDemo(client.id);

  // Catalogue lookups.
  const services = must(await db.from('service_catalog').select('id, code, name_es, base_price_cents'), 'Servicios');
  const service = (code) => {
    const found = services.find((item) => item.code === code);
    if (!found) throw new Error(`Falta el servicio ${code}: corré el seed del catálogo.`);
    return found;
  };
  const areaTypes = must(await db.from('area_types').select('code, decay_days'), 'Tipos de espacio');
  const decay = (code) => areaTypes.find((type) => type.code === code)?.decay_days ?? 30;
  let plans = must(await db.from('subscription_plans').select('*').eq('is_active', true).order('cadence_days', { ascending: false }), 'Planes');
  if (!plans.length) {
    // Same plans as supabase/seed.sql: staging may never have been seeded.
    plans = must(await db.from('subscription_plans').upsert([
      { name: 'Essential', description: 'Mantenimiento mensual', cadence_days: 30, base_price_cents: 28000 },
      { name: 'Signature', description: 'Mantenimiento quincenal', cadence_days: 14, base_price_cents: 52000 },
      { name: 'Estate', description: 'Mantenimiento semanal', cadence_days: 7, base_price_cents: 96000 },
    ], { onConflict: 'name' }).select('*'), 'Crear planes');
  }
  const plan = plans.find((item) => item.name === 'Signature') ?? plans[0];
  let team = must(await db.from('teams').select('*').eq('is_active', true).is('archived_at', null).order('created_at').limit(1).maybeSingle(), 'Equipo');
  if (!team) team = must(await db.from('teams').insert({ name: 'Equipo Miami 01', capacity_size: 3 }).select('*').single(), 'Crear equipo');
  await ensureCrew(team);

  // Property and spaces.
  const property = must(await db.from('properties').insert({
    client_id: client.id, label: 'Condo Brickell', address: '1200 Brickell Bay Dr, Apt 3401', city: 'Miami',
    postal_code: '33131', property_type: 'Condominio', square_feet: 1850, bedrooms: 3, bathrooms: 2,
    access_notes: 'Registrarse en recepción. Estacionamiento de visitas en P2.',
  }).select('*').single(), 'Crear propiedad');

  const spaceRows = [
    { code: 'kitchen', label: 'Cocina principal', measure: 220, percent: 90, req: 'Mesada de mármol: solo productos de pH neutro.' },
    { code: 'bathroom', label: 'Baño en suite', measure: 95, percent: 52, req: null },
    { code: 'window-wall', label: 'Ventanal del living', measure: 14, percent: 22, req: 'Piso 34: requiere acceso al balcón.' },
    { code: 'office', label: 'Home office', measure: 160, percent: 12, req: null },
    { code: 'garage', label: 'Cochera', measure: 300, percent: null, req: null },
  ];
  const areas = must(await db.from('property_areas').insert(spaceRows.map((row) => ({
    property_id: property.id,
    area_type_code: row.code,
    label: row.label,
    measurement_value: row.measure,
    requirements: row.req,
    last_cleaned_at: row.percent === null ? null : cleanedAtFor(row.percent, decay(row.code)),
  }))).select('id, area_type_code'), 'Crear espacios');
  const areaId = (code) => areas.find((area) => area.area_type_code === code).id;

  // Membership.
  if (plan) {
    const windowService = service('window-cleaning');
    const subscription = must(await db.from('subscriptions').insert({
      client_id: client.id, property_id: property.id, plan_id: plan.id, status: 'active',
      cadence_days: plan.cadence_days, preferred_weekday: 2, next_occurrence_date: nyDate(9),
      started_on: nyDate(-30), monthly_value_cents: plan.base_price_cents, notes: 'Membresía demo',
    }).select('id').single(), 'Crear membresía');
    must(await db.from('subscription_items').insert({
      subscription_id: subscription.id, service_id: windowService.id, quantity: 1,
      unit_price_cents: windowService.base_price_cents ?? 0, estimated_duration_minutes: 120,
    }), 'Ítem de membresía');
  }

  const base = {
    client_id: client.id, property_id: property.id, contact_name: client.name,
    contact_email: email, contact_phone: client.phone, locale: 'es', source: 'admin',
  };
  const insertRequest = async (code, extra) => must(await db.from('service_requests').insert({
    ...base, reference_code: reference(), service_id: service(code).id, service_name_snapshot: service(code).name_es, ...extra,
  }).select('id, reference_code').single(), 'Crear solicitud');

  // 1. History: the kitchen was cleaned two days ago.
  const done = await insertRequest('carpet-cleaning', { status: 'completed', notes: 'Limpieza profunda de cocina.' });
  const doneDate = nyDate(-2);
  must(await db.from('appointments').insert({
    service_request_id: done.id, property_id: property.id, team_id: team.id,
    starts_at: nyInstant(doneDate, 9), ends_at: nyInstant(doneDate, 11), status: 'completed',
    started_at: nyInstant(doneDate, 9), completed_at: nyInstant(doneDate, 11),
  }), 'Cita completada');
  must(await db.from('service_request_areas').insert({ service_request_id: done.id, property_area_id: areaId('kitchen') }), 'Vincular cocina');

  // 2. Confirmed visit for the window wall: the customer can request a change.
  const scheduled = await insertRequest('window-cleaning', { status: 'scheduled', preferred_date: nyDate(4) });
  const slot = await freeSlot(team.id, 4);
  must(await db.from('appointments').insert({
    service_request_id: scheduled.id, property_id: property.id, team_id: team.id,
    starts_at: slot.startsAt, ends_at: slot.endsAt, status: 'scheduled',
  }), 'Cita agendada');
  must(await db.from('service_request_areas').insert([
    { service_request_id: scheduled.id, property_area_id: areaId('window-wall') },
  ]), 'Vincular ventanal');

  // 3. Approved, waiting for a slot, with a pending change for the admin inbox.
  const waiting = await insertRequest('carpet-cleaning', { status: 'approved', preferred_date: nyDate(6), notes: 'Oficina y baño.' });
  must(await db.from('service_request_areas').insert([
    { service_request_id: waiting.id, property_area_id: areaId('office') },
    { service_request_id: waiting.id, property_area_id: areaId('bathroom') },
  ]), 'Vincular oficina y baño');
  must(await db.from('appointment_change_requests').insert({
    client_id: client.id, service_request_id: waiting.id, kind: 'schedule',
    preferred_date: nyDate(7), preferred_window: 'morning', reason: 'Prefiero por la mañana, antes de las 12.',
  }), 'Cambio pendiente');

  must(await db.from('request_activity').insert([done, scheduled, waiting].map((row) => ({
    service_request_id: row.id, action: 'request.created', metadata: { source: 'demo-script' },
  }))), 'Actividad');

  // Fresh tutorial on every run.
  must(await db.from('client_preferences').upsert({ client_id: client.id, guide_enabled: true, guide_progress: {} }), 'Preferencias');

  printCredentials(password, 'Datos demo creados: 1 propiedad, 5 espacios, membresía activa, 3 limpiezas y 1 cambio pendiente.');
}

function printCredentials(password, summary) {
  console.log(`\n✅ ${summary}`);
  console.log(`   Email:       ${email}`);
  console.log(`   Contraseña:  ${password}`);
  if (!process.env.DEMO_CUSTOMER_PASSWORD) {
    console.log('   (Para que la contraseña no cambie entre corridas, guardala como DEMO_CUSTOMER_PASSWORD en .env.local)');
  }
  console.log('\nEntrá en /login con esas credenciales; el panel del cliente está en /account.');
}

run().catch((error) => {
  console.error('❌ No fue posible crear el cliente demo:', error.message);
  process.exit(1);
});
