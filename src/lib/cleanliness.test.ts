import { describe, expect, it } from 'vitest';

import {
  cleanlinessBand,
  cleanlinessPercent,
  daysSinceCleaned,
  daysUntilPercent,
} from './cleanliness';

const NOW = new Date('2026-10-01T12:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

describe('cleanlinessPercent', () => {
  it('is 100 on the service day and 0 at the end of the cycle', () => {
    expect(cleanlinessPercent(daysAgo(0), 20, NOW)).toBe(100);
    expect(cleanlinessPercent(daysAgo(20), 20, NOW)).toBe(0);
  });

  it('falls linearly in between', () => {
    expect(cleanlinessPercent(daysAgo(10), 20, NOW)).toBe(50);
    expect(cleanlinessPercent(daysAgo(5), 20, NOW)).toBe(75);
  });

  it('never goes negative past the cycle', () => {
    expect(cleanlinessPercent(daysAgo(400), 20, NOW)).toBe(0);
  });

  it('distinguishes "never serviced" from "dirty"', () => {
    expect(cleanlinessPercent(null, 20, NOW)).toBeNull();
    expect(cleanlinessPercent(undefined, 20, NOW)).toBeNull();
  });

  it('rejects unusable input instead of returning a wrong number', () => {
    expect(cleanlinessPercent(daysAgo(5), 0, NOW)).toBeNull();
    expect(cleanlinessPercent(daysAgo(5), -3, NOW)).toBeNull();
    expect(cleanlinessPercent('no es una fecha', 20, NOW)).toBeNull();
  });

  it('clamps a future service date to 100 rather than exceeding it', () => {
    expect(cleanlinessPercent(daysAgo(-5), 20, NOW)).toBe(100);
  });
});

describe('daysUntilPercent', () => {
  it('counts down to the reminder threshold', () => {
    // 50% left on a 20-day cycle: 30% is 4 more days away.
    expect(daysUntilPercent(daysAgo(10), 20, 30, NOW)).toBeCloseTo(4);
  });

  it('goes negative once the threshold is behind us', () => {
    expect(daysUntilPercent(daysAgo(18), 20, 30, NOW)).toBeLessThan(0);
  });

  it('is null when never serviced', () => {
    expect(daysUntilPercent(null, 20, 30, NOW)).toBeNull();
  });
});

describe('cleanlinessBand', () => {
  it('maps percentages to bands', () => {
    expect(cleanlinessBand(100)).toBe('fresh');
    expect(cleanlinessBand(61)).toBe('fresh');
    expect(cleanlinessBand(45)).toBe('fading');
    expect(cleanlinessBand(30)).toBe('due');
    expect(cleanlinessBand(0)).toBe('due');
    expect(cleanlinessBand(null)).toBeNull();
  });
});

describe('daysSinceCleaned', () => {
  it('counts whole elapsed days', () => {
    expect(daysSinceCleaned(daysAgo(7), NOW)).toBe(7);
    expect(daysSinceCleaned(daysAgo(0), NOW)).toBe(0);
    expect(daysSinceCleaned(null, NOW)).toBeNull();
  });
});
