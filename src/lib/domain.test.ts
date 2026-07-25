import { describe, expect, test } from 'vitest';

import {
  canCrewTransitionRequest,
  canTransitionOrder,
  canTransitionRequest,
  dollarsToCents,
  newYorkLocalToIso,
  newYorkDate,
  safeInternalPath,
  subscriptionOccurrences,
} from './domain';

describe('DOGE domain invariants', () => {
  test('enforces the request state machine', () => {
    expect(canTransitionRequest('new', 'reviewing')).toBe(true);
    expect(canTransitionRequest('new', 'completed')).toBe(false);
    expect(canTransitionRequest('completed', 'in_progress')).toBe(false);
  });

  test('limits crew to starting and completing assigned work', () => {
    expect(canCrewTransitionRequest('scheduled', 'in_progress')).toBe(true);
    expect(canCrewTransitionRequest('in_progress', 'completed')).toBe(true);
    expect(canCrewTransitionRequest('approved', 'scheduled')).toBe(false);
  });

  test('does not allow inventory-affecting order transitions to repeat', () => {
    expect(canTransitionOrder('draft', 'confirmed')).toBe(true);
    expect(canTransitionOrder('confirmed', 'confirmed')).toBe(false);
    expect(canTransitionOrder('cancelled', 'confirmed')).toBe(false);
  });

  test('stores money as rounded integer cents', () => {
    expect(dollarsToCents(19.99)).toBe(1999);
    expect(dollarsToCents(0.105)).toBe(11);
    expect(() => dollarsToCents(-1)).toThrow();
  });

  test('generates recurring dates without duplicates inside a horizon', () => {
    expect(subscriptionOccurrences('2026-07-01', 14, '2026-08-01')).toEqual([
      '2026-07-01',
      '2026-07-15',
      '2026-07-29',
    ]);
  });

  test('accepts only local redirect paths', () => {
    expect(safeInternalPath('/admin/requests', '/admin')).toBe('/admin/requests');
    expect(safeInternalPath('//evil.example', '/admin')).toBe('/admin');
    expect(safeInternalPath('/\\evil.example', '/admin')).toBe('/admin');
    expect(safeInternalPath('https://evil.example', '/admin')).toBe('/admin');
  });

  test('converts New York business time to UTC across daylight saving time', () => {
    expect(newYorkLocalToIso('2026-07-24T09:00')).toBe('2026-07-24T13:00:00.000Z');
    expect(newYorkLocalToIso('2026-01-24T09:00')).toBe('2026-01-24T14:00:00.000Z');
  });

  test('formats the New York operating date independently of server timezone', () => {
    expect(newYorkDate('2026-07-24T02:00:00.000Z')).toBe('2026-07-23');
  });
});
