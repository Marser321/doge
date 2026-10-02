/**
 * Cleanliness decays linearly from the moment an area was last serviced.
 *
 * The percentage is never persisted: it is a pure function of elapsed time, so
 * the panel can animate it without a round trip and the nightly sweep can
 * recompute it with the same formula in SQL. Only threshold crossings need
 * state, and `email_outbox.event_key` carries that.
 *
 * The cycle length (`decay_days`) is owned by DOGE via `area_types`, not by the
 * customer, so the signal stays comparable across accounts.
 */

/** Thresholds that trigger a reminder. Mirrors `sweep_area_reminders`. */
export const REMINDER_THRESHOLDS = [30, 25] as const;

export type CleanlinessBand = 'fresh' | 'fading' | 'due';

/**
 * Percentage of cleanliness left, 100 on the service day down to 0 after
 * `decayDays`. Returns null when the area has never been serviced — that is a
 * different state from "dirty" and the UI must not conflate them.
 */
export function cleanlinessPercent(
  lastCleanedAt: string | Date | null | undefined,
  decayDays: number,
  now: Date = new Date(),
): number | null {
  if (!lastCleanedAt) return null;
  if (!Number.isFinite(decayDays) || decayDays <= 0) return null;

  const last = lastCleanedAt instanceof Date ? lastCleanedAt : new Date(lastCleanedAt);
  const lastMs = last.getTime();
  if (Number.isNaN(lastMs)) return null;

  const elapsedDays = (now.getTime() - lastMs) / 86_400_000;
  if (elapsedDays <= 0) return 100;

  const remaining = 100 - (elapsedDays / decayDays) * 100;
  return Math.min(100, Math.max(0, remaining));
}

/**
 * Days left before the area reaches `target` percent. Negative once it is
 * already past, null when it was never serviced.
 */
export function daysUntilPercent(
  lastCleanedAt: string | Date | null | undefined,
  decayDays: number,
  target: number,
  now: Date = new Date(),
): number | null {
  const current = cleanlinessPercent(lastCleanedAt, decayDays, now);
  if (current === null) return null;
  return ((current - target) / 100) * decayDays;
}

/** Coarse band for styling. Colour is never the only channel in the UI. */
export function cleanlinessBand(percent: number | null): CleanlinessBand | null {
  if (percent === null) return null;
  if (percent > 60) return 'fresh';
  if (percent > REMINDER_THRESHOLDS[0]) return 'fading';
  return 'due';
}

/** Whole days since the last service, for "hace N días" copy. */
export function daysSinceCleaned(
  lastCleanedAt: string | Date | null | undefined,
  now: Date = new Date(),
): number | null {
  if (!lastCleanedAt) return null;
  const last = lastCleanedAt instanceof Date ? lastCleanedAt : new Date(lastCleanedAt);
  if (Number.isNaN(last.getTime())) return null;
  return Math.max(0, Math.floor((now.getTime() - last.getTime()) / 86_400_000));
}
