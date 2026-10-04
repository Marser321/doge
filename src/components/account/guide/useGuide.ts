'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { apiRequest } from '@/lib/api-client'
import {
  guideCompletion,
  guideSteps,
  newlyObserved,
  nextGuideStep,
  type GuideFacts,
  type GuideFlag,
  type GuideProgress,
} from '@/lib/guide'

type GuideState = { enabled: boolean; progress: GuideProgress }
type GuidePatch = { enabled?: boolean; complete?: GuideFlag[]; reset?: true }

/**
 * Account-backed guide state. Writes are optimistic: the checklist reacts at
 * once and the server response (the merged truth) replaces it afterwards.
 */
export function useGuide(facts: GuideFacts | null) {
  const [state, setState] = useState<GuideState | null>(null)
  const pendingObserved = useRef(false)

  useEffect(() => {
    let cancelled = false
    apiRequest<GuideState>('/api/me/guide', { auth: 'required', cache: 'no-store' })
      .then((data) => { if (!cancelled) setState(data) })
      // The guide is an aid, not a blocker: fall back to an enabled, empty one.
      .catch(() => { if (!cancelled) setState({ enabled: true, progress: {} }) })
    return () => { cancelled = true }
  }, [])

  // Writes are serialised: the server merges against what it last stored, so
  // two overlapping PATCHes would otherwise drop each other's flags.
  const queue = useRef<Promise<void>>(Promise.resolve())
  const inFlight = useRef(0)

  const patch = useCallback((body: GuidePatch, optimistic: (prev: GuideState) => GuideState) => {
    setState((prev) => (prev ? optimistic(prev) : prev))
    inFlight.current += 1
    const run = queue.current.then(async () => {
      try {
        const saved = await apiRequest<GuideState>('/api/me/guide', { method: 'PATCH', auth: 'required', body })
        // Only the last write's answer reflects every optimistic change.
        if (inFlight.current === 1) setState(saved)
      } catch {
        // Keep the optimistic state; the next load reconciles it.
      } finally {
        inFlight.current -= 1
      }
    })
    queue.current = run
    return run
  }, [])

  const complete = useCallback((...flags: GuideFlag[]) => {
    const stamp = new Date().toISOString()
    return patch({ complete: flags }, (prev) => {
      const progress = { ...prev.progress }
      for (const flag of flags) progress[flag] ??= stamp
      return { ...prev, progress }
    })
  }, [patch])

  const setEnabled = useCallback((enabled: boolean) => (
    patch({ enabled }, (prev) => ({ ...prev, enabled }))
  ), [patch])

  const restart = useCallback(() => (
    patch({ reset: true }, () => ({ enabled: true, progress: {} }))
  ), [patch])

  // Persist steps the customer completed by simply using the panel.
  useEffect(() => {
    if (!state || !facts || pendingObserved.current) return
    const observed = newlyObserved(state.progress, facts)
    if (!observed.length) return
    pendingObserved.current = true
    void complete(...observed).finally(() => { pendingObserved.current = false })
  }, [state, facts, complete])

  const derived = useMemo(() => {
    if (!state || !facts) return null
    return {
      steps: guideSteps(state.progress, facts),
      next: nextGuideStep(state.progress, facts),
      completion: guideCompletion(state.progress, facts),
    }
  }, [state, facts])

  return {
    loaded: state !== null,
    enabled: state?.enabled ?? false,
    progress: state?.progress ?? {},
    steps: derived?.steps ?? [],
    next: derived?.next ?? null,
    completion: derived?.completion ?? 0,
    complete,
    setEnabled,
    restart,
  }
}

export type GuideController = ReturnType<typeof useGuide>
