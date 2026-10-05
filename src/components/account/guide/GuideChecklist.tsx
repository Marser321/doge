'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, EyeOff, PartyPopper } from 'lucide-react'

import type { TranslationKey } from '@/data/i18n'
import type { GuideStep, GuideStepState } from '@/lib/guide'

/** What a checklist row does when pressed. */
export type GuideAction =
  | { kind: 'callback'; label: TranslationKey; run: () => void }
  | { kind: 'link'; label: TranslationKey; href: string }

type Props = {
  steps: GuideStepState[]
  next: GuideStep | null
  completion: number
  t: (key: TranslationKey) => string
  actionFor: (step: GuideStep) => GuideAction
  onHide: () => void
}

const COPY: Record<GuideStep, { title: TranslationKey; body: TranslationKey }> = {
  property: { title: 'guide.stepPropertyTitle', body: 'guide.stepPropertyBody' },
  space: { title: 'guide.stepSpaceTitle', body: 'guide.stepSpaceBody' },
  cleanliness: { title: 'guide.stepCleanlinessTitle', body: 'guide.stepCleanlinessBody' },
  schedule: { title: 'guide.stepScheduleTitle', body: 'guide.stepScheduleBody' },
  membership: { title: 'guide.stepMembershipTitle', body: 'guide.stepMembershipBody' },
}

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function ProgressRing({ value }: { value: number }) {
  const reduceMotion = useReducedMotion()
  return (
    <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
      <circle cx="28" cy="28" r={RADIUS} fill="none" strokeWidth="5" className="stroke-foreground/10" />
      <motion.circle
        cx="28" cy="28" r={RADIUS} fill="none" strokeWidth="5" strokeLinecap="round"
        className="stroke-red-400"
        strokeDasharray={CIRCUMFERENCE}
        initial={reduceMotion ? false : { strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - value / 100) }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

/**
 * "Primeros pasos": the guide's home. The next pending step is expanded with
 * its explanation and a direct action; done steps collapse to a check.
 */
export function GuideChecklist({ steps, next, completion, t, actionFor, onHide }: Props) {
  const reduceMotion = useReducedMotion()

  return (
    <section
      data-guide="checklist"
      aria-labelledby="guide-checklist-title"
      className="luxury-glass mb-10 rounded-[28px] border border-accent/10 p-6 md:p-7"
    >
      <header className="flex items-center gap-4">
        <div className="relative shrink-0">
          <ProgressRing value={completion} />
          <span className="absolute inset-0 grid place-items-center text-[11px] font-black tabular-nums">{completion}%</span>
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="guide-checklist-title" className="font-michroma text-lg uppercase tracking-tight">{t('guide.title')}</h2>
          <p className="mt-1 text-xs font-medium text-accent">
            {next ? t('guide.subtitle') : t('guide.allDone')}
          </p>
        </div>
        <button
          type="button"
          onClick={onHide}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent/70 transition-colors hover:text-foreground"
        >
          <EyeOff className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t('guide.hide')}</span>
        </button>
      </header>

      {next === null ? (
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm font-medium text-emerald-200"
        >
          <PartyPopper className="h-5 w-5 shrink-0" /> {t('guide.allDone')}
        </motion.p>
      ) : (
        <ol className="mt-6 space-y-2">
          {steps.map((step, position) => {
            const copy = COPY[step.id]
            const current = step.id === next
            const action = actionFor(step.id)
            const actionClass = 'inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-90'
            return (
              <li
                key={step.id}
                className={`rounded-2xl border transition-colors ${current ? 'border-red-400/30 bg-red-500/5' : 'border-transparent'}`}
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black ${
                      step.done ? 'bg-emerald-400/20 text-emerald-300' : current ? 'bg-red-400 text-white' : 'bg-foreground/10 text-accent'
                    }`}
                    aria-hidden
                  >
                    {step.done ? <Check className="h-3.5 w-3.5" /> : position + 1}
                  </span>
                  <span className={`text-sm font-semibold ${step.done ? 'text-accent line-through decoration-accent/40' : 'text-foreground'}`}>
                    {t(copy.title)}
                    <span className="sr-only">{step.done ? ' ✓' : ''}</span>
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {current && (
                    <motion.div
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-4 pl-[3.25rem]">
                        <p className="text-sm leading-relaxed text-accent">{t(copy.body)}</p>
                        <div className="mt-3">
                          {action.kind === 'link' ? (
                            <Link href={action.href} className={actionClass}>
                              {t(action.label)} <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <button type="button" onClick={action.run} className={actionClass}>
                              {t(action.label)} <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
