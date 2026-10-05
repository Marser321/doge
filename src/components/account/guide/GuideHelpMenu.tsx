'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CircleHelp, Compass, RotateCcw } from 'lucide-react'

import type { TranslationKey } from '@/data/i18n'

type Props = {
  enabled: boolean
  t: (key: TranslationKey) => string
  onToggle: (enabled: boolean) => void
  onStartTour: () => void
  onRestart: () => void
}

/** "Ayuda": turn the guide on or off, replay the tour, or start over. */
export function GuideHelpMenu({ enabled, t, onToggle, onStartTour, onRestart }: Props) {
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const item = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-foreground/5'

  return (
    <div ref={rootRef} className="relative" data-guide="help">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={menuId}
        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent transition-colors hover:text-foreground"
      >
        <CircleHelp className="h-4 w-4" /> {t('guide.help')}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={reduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="absolute right-0 z-50 mt-3 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-accent/15 bg-background p-2 shadow-2xl shadow-black/40"
          >
            <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl px-3 py-3 hover:bg-foreground/5">
              <span>
                <span className="block text-sm font-semibold text-foreground">{t('guide.toggleLabel')}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-accent">{t('guide.toggleHint')}</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={enabled}
                onChange={(event) => onToggle(event.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-red-400 ${enabled ? 'bg-emerald-500' : 'bg-foreground/20'}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
              </span>
            </label>
            <div className="my-1 h-px bg-accent/10" />
            <button type="button" className={item} onClick={() => { setOpen(false); onStartTour() }}>
              <Compass className="h-4 w-4 text-accent" /> {t('guide.startTour')}
            </button>
            <button type="button" className={item} onClick={() => { setOpen(false); onRestart() }}>
              <RotateCcw className="h-4 w-4 text-accent" /> {t('guide.restart')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
