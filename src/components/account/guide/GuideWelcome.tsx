'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Compass, Gauge, Home, Sparkles } from 'lucide-react'

import type { TranslationKey } from '@/data/i18n'

type Props = {
  name: string
  t: (key: TranslationKey) => string
  onStart: () => void
  onLater: () => void
}

/** First-visit invitation to the guided tour. */
export function GuideWelcome({ name, t, onStart, onLater }: Props) {
  const reduceMotion = useReducedMotion()
  const startRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    startRef.current?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onLater() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onLater])

  if (typeof document === 'undefined') return null

  const icons = [Home, Gauge, Sparkles]

  return createPortal(
    <div className="fixed inset-0 z-[1000] grid place-items-center p-4">
      <motion.div
        className="absolute inset-0 bg-[rgba(5,5,8,0.72)] backdrop-blur-sm"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onLater}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-welcome-title"
        className="relative w-full max-w-md rounded-[28px] border border-accent/15 bg-background p-7 text-foreground shadow-2xl shadow-black/50"
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex gap-2" aria-hidden>
          {icons.map((Icon, position) => (
            <motion.span
              key={position}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-accent/15 bg-foreground/5 text-red-300"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { delay: 0.15 + position * 0.08, duration: 0.4 }}
            >
              <Icon className="h-5 w-5" />
            </motion.span>
          ))}
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent">{name}</p>
        <h2 id="guide-welcome-title" className="mt-2 font-michroma text-2xl uppercase tracking-tight">{t('guide.welcomeTitle')}</h2>
        <p className="mt-3 text-sm leading-relaxed text-accent">{t('guide.welcomeBody')}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <button
            ref={startRef}
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-3 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-90"
          >
            <Compass className="h-4 w-4" /> {t('guide.welcomeStart')}
          </button>
          <button
            type="button"
            onClick={onLater}
            className="rounded-xl border border-accent/20 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:text-foreground"
          >
            {t('guide.welcomeLater')}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  )
}
