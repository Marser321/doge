/**
 * The customer guide: a short checklist that teaches the panel by doing.
 *
 * Steps complete themselves from real account state (a property exists, an
 * area exists…) so the checklist never asks the customer to tick a box for
 * something they already did. Steps with nothing to observe — reading how the
 * cleanliness percentage works — are completed explicitly and stored in
 * `client_preferences.guide_progress`.
 */

export const GUIDE_STEPS = ['property', 'space', 'cleanliness', 'schedule', 'membership'] as const;

export type GuideStep = (typeof GUIDE_STEPS)[number];

/** Everything that can be stored: the steps plus "the guided tour was seen". */
export const GUIDE_FLAGS = [...GUIDE_STEPS, 'tour'] as const;

export type GuideFlag = (typeof GUIDE_FLAGS)[number];

/** `{ flag: ISO timestamp }` as persisted on the account. */
export type GuideProgress = Partial<Record<GuideFlag, string>>;

/** Account facts the checklist can observe without the customer's help. */
export type GuideFacts = {
  properties: number;
  areas: number;
  requests: number;
  hasMembership: boolean;
};

export type GuideStepState = { id: GuideStep; done: boolean };

export function isGuideFlag(value: unknown): value is GuideFlag {
  return typeof value === 'string' && (GUIDE_FLAGS as readonly string[]).includes(value);
}

/** Drops unknown keys and non-string values from stored progress. */
export function sanitizeProgress(value: unknown): GuideProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const clean: GuideProgress = {};
  for (const [key, stamp] of Object.entries(value)) {
    if (isGuideFlag(key) && typeof stamp === 'string' && stamp.length <= 40) clean[key] = stamp;
  }
  return clean;
}

function observed(step: GuideStep, facts: GuideFacts): boolean {
  switch (step) {
    case 'property': return facts.properties > 0;
    case 'space': return facts.areas > 0;
    case 'schedule': return facts.requests > 0;
    case 'membership': return facts.hasMembership;
    case 'cleanliness': return false;
  }
}

export function guideSteps(progress: GuideProgress, facts: GuideFacts): GuideStepState[] {
  return GUIDE_STEPS.map((id) => ({ id, done: Boolean(progress[id]) || observed(id, facts) }));
}

/** First pending step, or null when the guide is finished. */
export function nextGuideStep(progress: GuideProgress, facts: GuideFacts): GuideStep | null {
  return guideSteps(progress, facts).find((step) => !step.done)?.id ?? null;
}

/** Whole percentage of completed steps, for the progress ring. */
export function guideCompletion(progress: GuideProgress, facts: GuideFacts): number {
  const steps = guideSteps(progress, facts);
  return Math.round((steps.filter((step) => step.done).length / steps.length) * 100);
}

/**
 * Steps that became observable but are not stored yet. Persisting them keeps
 * the checklist stable if, say, the customer later archives their only area.
 */
export function newlyObserved(progress: GuideProgress, facts: GuideFacts): GuideStep[] {
  return GUIDE_STEPS.filter((step) => !progress[step] && observed(step, facts));
}
