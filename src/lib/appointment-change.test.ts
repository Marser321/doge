import { describe, expect, it } from 'vitest';

import { canRequestChange, earliestChangeDate, validateChangeInput } from './appointment-change';

// Noon in New York on 2026-10-03.
const now = new Date('2026-10-03T16:00:00.000Z');

describe('appointment change rules', () => {
  it('accepts open requests without an appointment', () => {
    expect(canRequestChange('new', null, now)).toEqual({ allowed: true });
  });

  it('refuses closed requests', () => {
    expect(canRequestChange('completed', null, now)).toEqual({ allowed: false, reason: 'closed' });
    expect(canRequestChange('in_progress', null, now)).toEqual({ allowed: false, reason: 'closed' });
  });

  it('enforces 24 hours of notice before a scheduled visit', () => {
    expect(canRequestChange('scheduled', '2026-10-04T10:00:00.000Z', now)).toEqual({ allowed: false, reason: 'too-late' });
    expect(canRequestChange('scheduled', '2026-10-04T17:00:00.000Z', now)).toEqual({ allowed: true });
  });

  it('proposes tomorrow in New York as the earliest date', () => {
    expect(earliestChangeDate(now)).toBe('2026-10-04');
  });

  it('validates the requested date and window', () => {
    expect(validateChangeInput({ kind: 'reschedule', preferredDate: '2026-10-03' }, now)).toMatch(/posterior/);
    expect(validateChangeInput({ kind: 'reschedule', preferredDate: '' }, now)).toMatch(/fecha/);
    expect(validateChangeInput({ kind: 'schedule', preferredDate: '2026-10-05', preferredWindow: 'night' }, now)).toMatch(/franja/);
    expect(validateChangeInput({ kind: 'schedule', preferredDate: '2026-10-05', preferredWindow: 'morning' }, now)).toBeNull();
  });

  it('requires a reason to cancel', () => {
    expect(validateChangeInput({ kind: 'cancel' }, now)).toMatch(/motivo/);
    expect(validateChangeInput({ kind: 'cancel', reason: 'Viaje' }, now)).toBeNull();
  });
});
