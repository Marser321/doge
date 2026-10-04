'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'

import type { TranslationKey } from '@/data/i18n'

export type TourStop = {
  /** Value of the `data-guide` attribute to highlight. */
  target: string
  title: TranslationKey
  body: TranslationKey
  /** Panel tab that must be visible before the target exists. */
  tab?: string
}

type Props = {
  stops: TourStop[]
  startAt?: number
  t: (key: TranslationKey) => string
  onStop: (stop: TourStop) => void
  onClose: (finished: boolean) => void
}

type Rect = { top: number; left: number; width: number; height: number }

const PAD = 10
const TOOLTIP_WIDTH = 340
const GUTTER = 16

function findTarget(target: string) {
  return document.querySelector<HTMLElement>(`[data-guide="${target}"]`)
}

/**
 * Spotlight walkthrough. It dims the page, cuts a rounded window around the
 * current target and anchors a small dialog next to it. Targets live on other
 * tabs, so each stop first asks the page to switch, then waits for the node.
 */
export function GuideTour({ stops, startAt = 0, t, onStop, onClose }: Props) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(Math.min(startAt, stops.length - 1))
  const [rect, setRect] = useState<Rect | null>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })
  const dialogRef = useRef<HTMLDivElement>(null)
  const stop = stops[index]
  const last = index === stops.length - 1

  // Switch tab, then poll briefly for the target to mount and scroll to it.
  useEffect(() => {
    if (!stop) return
    onStop(stop)
    setRect(null)
    let attempts = 0
    let frame = 0
    const locate = () => {
      const node = findTarget(stop.target)
      if (node) {
        node.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' })
        // Measure after the scroll settles.
        window.setTimeout(() => {
          const box = node.getBoundingClientRect()
          setRect({ top: box.top, left: box.left, width: box.width, height: box.height })
        }, reduceMotion ? 0 : 320)
        return
      }
      if (attempts++ < 30) frame = window.requestAnimationFrame(locate)
    }
    frame = window.requestAnimationFrame(locate)
    return () => window.cancelAnimationFrame(frame)
    // onStop is intentionally excluded: it changes identity on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop, reduceMotion])

  // Follow the target on scroll and resize.
  useLayoutEffect(() => {
    const measure = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      if (!stop) return
      const node = findTarget(stop.target)
      if (!node) return
      const box = node.getBoundingClientRect()
      setRect({ top: box.top, left: box.left, width: box.width, height: box.height })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [stop])

  const go = useCallback((delta: number) => {
    setIndex((current) => Math.max(0, Math.min(stops.length - 1, current + delta)))
  }, [stops.length])

  // Keyboard: Esc closes, arrows navigate, Tab stays inside the dialog.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(false) }
      else if (event.key === 'ArrowRight' && !last) { event.preventDefault(); go(1) }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1) }
      else if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button'))
        if (!focusable.length) return
        const first = focusable[0]
        const lastNode = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); lastNode.focus() }
        else if (!event.shiftKey && document.activeElement === lastNode) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, last, onClose])

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>('[data-primary]')?.focus({ preventScroll: true })
  }, [index])

  if (!stop || typeof document === 'undefined') return null

  const width = Math.min(TOOLTIP_WIDTH, viewport.width - GUTTER * 2)
  const spot = rect && {
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
  }
  // Below the target when there is room, otherwise above; centred if unknown.
  const below = spot ? spot.top + spot.height + 220 < viewport.height : true
  const dialogStyle = spot
    ? {
      width,
      left: Math.max(GUTTER, Math.min(spot.left, viewport.width - width - GUTTER)),
      ...(below
        ? { top: spot.top + spot.height + 12 }
        : { bottom: Math.max(GUTTER, viewport.height - spot.top + 12) }),
    }
    : { width, left: (viewport.width - width) / 2, top: viewport.height / 2 - 110 }
  const spring = reduceMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 260, damping: 30 }

  return createPortal(
    <div className="fixed inset-0 z-[1000]" aria-live="polite">
      {/* Click-catcher: the page underneath is inert during the tour. */}
      <div className="absolute inset-0" onClick={() => onClose(false)} aria-hidden />
      {spot ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-[24px] ring-2 ring-red-400/70"
          style={{ boxShadow: '0 0 0 9999px rgba(5, 5, 8, 0.72)' }}
          initial={false}
          animate={spot}
          transition={spring}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-[rgba(5,5,8,0.72)]" />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-tour-title"
          aria-describedby="guide-tour-body"
          className="absolute rounded-2xl border border-accent/15 bg-background p-5 text-foreground shadow-2xl shadow-black/50"
          style={dialogStyle}
          initial={reduceMotion ? false : { opacity: 0, y: below ? 8 : -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-300">
              {t('guide.stepOf').replace('{n}', String(index + 1)).replace('{total}', String(stops.length))}
            </p>
            <button
              type="button"
              onClick={() => onClose(false)}
              aria-label={t('guide.skip')}
              className="-m-1 rounded-lg p-1 text-accent transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h2 id="guide-tour-title" className="mt-2 font-michroma text-base uppercase tracking-tight">{t(stop.title)}</h2>
          <p id="guide-tour-body" className="mt-2 text-sm leading-relaxed text-accent">{t(stop.body)}</p>

          <div className="mt-4 flex items-center gap-1.5" aria-hidden>
            {stops.map((item, dot) => (
              <span
                key={item.target}
                className={`h-1.5 rounded-full transition-all ${dot === index ? 'w-5 bg-red-400' : dot < index ? 'w-1.5 bg-foreground/60' : 'w-1.5 bg-foreground/15'}`}
              />
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => (index === 0 ? onClose(false) : go(-1))}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:text-foreground"
            >
              {index === 0 ? t('guide.skip') : <><ArrowLeft className="h-3.5 w-3.5" /> {t('guide.back')}</>}
            </button>
            <button
              type="button"
              data-primary
              onClick={() => (last ? onClose(true) : go(1))}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-90"
            >
              {last ? t('guide.finish') : <>{t('guide.next')} <ArrowRight className="h-3.5 w-3.5" /></>}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  )
}
