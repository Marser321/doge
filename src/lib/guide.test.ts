import { describe, expect, it } from 'vitest';

import {
  guideCompletion,
  guideSteps,
  newlyObserved,
  nextGuideStep,
  sanitizeProgress,
  type GuideFacts,
} from './guide';

const empty: GuideFacts = { properties: 0, areas: 0, requests: 0, hasMembership: false };

describe('customer guide', () => {
  it('starts at the property step for a brand new account', () => {
    expect(nextGuideStep({}, empty)).toBe('property');
    expect(guideCompletion({}, empty)).toBe(0);
  });

  it('completes steps from observed account state', () => {
    const facts = { ...empty, properties: 1, areas: 2 };
    expect(guideSteps({}, facts).filter((step) => step.done).map((step) => step.id)).toEqual(['property', 'space']);
    expect(nextGuideStep({}, facts)).toBe('cleanliness');
  });

  it('keeps stored steps done even when the observed state goes away', () => {
    const progress = { space: '2026-10-01T00:00:00.000Z' };
    expect(guideSteps(progress, empty).find((step) => step.id === 'space')?.done).toBe(true);
  });

  it('only reports observed steps that are not persisted yet', () => {
    const facts = { ...empty, properties: 1, hasMembership: true };
    expect(newlyObserved({ property: 'x' }, facts)).toEqual(['membership']);
  });

  it('finishes at 100% with no next step', () => {
    const facts = { properties: 1, areas: 1, requests: 1, hasMembership: true };
    expect(nextGuideStep({ cleanliness: 'x' }, facts)).toBeNull();
    expect(guideCompletion({ cleanliness: 'x' }, facts)).toBe(100);
  });

  it('drops unknown keys and malformed values', () => {
    expect(sanitizeProgress({ space: 'x', tour: 'z', hack: 'y', property: 3 })).toEqual({ space: 'x', tour: 'z' });
    expect(sanitizeProgress(['space'])).toEqual({});
    expect(sanitizeProgress(null)).toEqual({});
  });
});
