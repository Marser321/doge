'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { cleanlinessBand, type CleanlinessBand } from '@/lib/cleanliness'

type Props = {
  percent: number | null
  /** Short status word shown beside the number. Colour is never the only cue. */
  label: string
  compact?: boolean
}

/**
 * Horizontal cleanliness bar.
 *
 * Colour carries the band, but the percentage and the label always repeat it in
 * text, so the state survives colour-blindness and greyscale printing.
 */
const BAND_BAR: Record<CleanlinessBand, string> = {
  fresh: 'bg-emerald-400',
  fading: 'bg-amber-400',
  due: 'bg-red-400',
}

const BAND_TEXT: Record<CleanlinessBand, string> = {
  fresh: 'text-emerald-300',
  fading: 'text-amber-300',
  due: 'text-red-300',
}

export function CleanlinessMeter({ percent, label, compact = false }: Props) {
  const reduceMotion = useReducedMotion()
  const band = cleanlinessBand(percent)
  const rounded = percent === null ? null : Math.round(percent)

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <span className={`font-michroma tabular-nums ${compact ? 'text-xl' : 'text-3xl'} ${band ? BAND_TEXT[band] : 'text-accent/50'}`}>
          {rounded === null ? '—' : `${rounded}%`}
        </span>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${band ? BAND_TEXT[band] : 'text-accent/50'}`}>
          {label}
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-foreground/10"
        role="meter"
        aria-valuenow={rounded ?? undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          className={`h-full rounded-full ${band ? BAND_BAR[band] : 'bg-accent/30'}`}
          initial={reduceMotion ? false : { width: 0 }}
          animate={{ width: `${rounded ?? 0}%` }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}
