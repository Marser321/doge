/**
 * Rules for customer-initiated appointment changes. They mirror
 * `request_appointment_change` so the UI can explain a refusal before the
 * round trip; the database stays the authority.
 */

import { newYorkDate } from '@/lib/domain';

/** Minimum notice before a scheduled visit, in hours. */
export const CHANGE_LEAD_HOURS = 24;

export const CHANGE_WINDOWS = ['morning', 'afternoon', 'flexible'] as const;
export type ChangeWindow = (typeof CHANGE_WINDOWS)[number];

export type ChangeKind = 'schedule' | 'reschedule' | 'cancel';

/** Request statuses that still accept a change from the customer. */
const OPEN_STATUSES = new Set(['new', 'reviewing', 'quoted', 'approved', 'scheduled']);

export function canRequestChange(
  status: string,
  appointmentStartsAt: string | null,
  now: Date = new Date(),
): { allowed: true } | { allowed: false; reason: 'closed' | 'too-late' } {
  if (!OPEN_STATUSES.has(status)) return { allowed: false, reason: 'closed' };
  if (appointmentStartsAt) {
    const startsMs = new Date(appointmentStartsAt).getTime();
    if (startsMs - now.getTime() < CHANGE_LEAD_HOURS * 3_600_000) return { allowed: false, reason: 'too-late' };
  }
  return { allowed: true };
}

/** Earliest date a customer may propose: tomorrow in New York. */
export function earliestChangeDate(now: Date = new Date()): string {
  return newYorkDate(new Date(now.getTime() + 86_400_000));
}

export type ChangeInput = {
  kind: ChangeKind;
  preferredDate?: string | null;
  preferredWindow?: string | null;
  reason?: string | null;
};

/** Returns a user-facing error, or null when the input is acceptable. */
export function validateChangeInput(input: ChangeInput, now: Date = new Date()): string | null {
  const reason = input.reason?.trim() ?? '';
  if (reason.length > 1000) return 'El motivo no puede superar los 1000 caracteres.';
  if (input.kind === 'cancel') {
    return reason ? null : 'Contanos el motivo de la cancelación.';
  }
  const date = input.preferredDate?.trim() ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Elegí una fecha preferida.';
  if (date < earliestChangeDate(now)) return 'La fecha preferida debe ser posterior a hoy.';
  if (input.preferredWindow && !(CHANGE_WINDOWS as readonly string[]).includes(input.preferredWindow)) {
    return 'La franja horaria no es válida.';
  }
  return null;
}
