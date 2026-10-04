'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CalendarClock, Gauge, LayoutGrid, ShieldCheck, Sparkles } from 'lucide-react'

import { formatVisit } from '@/components/account/CleaningsList'
import { activeAppointment, type AccountRequest, type AccountSubscription, type PropertyArea } from '@/components/account/types'
import type { Lang, TranslationKey } from '@/data/i18n'
import { cleanlinessBand, cleanlinessPercent, REMINDER_THRESHOLDS } from '@/lib/cleanliness'

type Props = {
  areas: PropertyArea[]
  requests: AccountRequest[]
  subscription: AccountSubscription
  lang: Lang
  t: (key: TranslationKey) => string
  onViewSpaces: () => void
}

export function areaPercent(area: PropertyArea) {
  return cleanlinessPercent(area.last_cleaned_at, area.area_type?.decay_days ?? 30)
}

/** Areas at or below the first reminder threshold. Never-cleaned ones are not "due". */
export function dueAreas(areas: PropertyArea[]) {
  return areas.filter((area) => {
    const percent = areaPercent(area)
    return percent !== null && percent <= REMINDER_THRESHOLDS[0]
  })
}

const BAND_TEXT = { fresh: 'text-emerald-300', fading: 'text-amber-300', due: 'text-red-300' } as const

/** Home tab: the account at a glance, plus what needs attention first. */
export function AccountSummary({ areas, requests, subscription, lang, t, onViewSpaces }: Props) {
  const reduceMotion = useReducedMotion()
  const measured = areas.map(areaPercent).filter((value): value is number => value !== null)
  const average = measured.length ? Math.round(measured.reduce((sum, value) => sum + value, 0) / measured.length) : null
  const due = dueAreas(areas)
  const averageBand = cleanlinessBand(average)

  const nextVisit = requests
    .map(activeAppointment)
    .filter((appointment) => appointment && appointment.status === 'scheduled' && new Date(appointment.starts_at) > new Date())
    .sort((a, b) => a!.starts_at.localeCompare(b!.starts_at))[0]

  const membershipLabel = !subscription
    ? t('panel.summaryNoMembership')
    : subscription.status === 'active' ? `${subscription.plan?.name ?? ''} · ${t('panel.membershipActive')}`
      : subscription.status === 'paused' ? t('panel.membershipPaused')
        : subscription.status === 'cancelled' ? t('panel.membershipCancelled')
          : t('panel.membershipPending')

  const tiles = [
    {
      icon: Gauge,
      label: t('panel.summaryAverage'),
      value: average === null ? '—' : `${average}%`,
      tone: averageBand ? BAND_TEXT[averageBand] : 'text-accent/60',
      big: true,
    },
    { icon: LayoutGrid, label: t('panel.summarySpaces'), value: String(areas.length), tone: 'text-foreground', big: true },
    {
      icon: CalendarClock,
      label: t('panel.summaryNext'),
      value: nextVisit ? formatVisit(nextVisit.starts_at, lang) : t('panel.summaryNone'),
      tone: nextVisit ? 'text-foreground' : 'text-accent/60',
      big: false,
    },
    { icon: ShieldCheck, label: t('panel.tabMembership'), value: membershipLabel, tone: subscription?.status === 'active' ? 'text-emerald-300' : 'text-accent', big: false },
  ]

  return (
    <section data-guide="summary" aria-label={t('panel.tabHome')} className="mb-10">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile, position) => (
          <motion.div
            key={tile.label}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.5, delay: position * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-[24px] border border-accent/10 bg-foreground/5 p-5"
          >
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
              <tile.icon className="h-3.5 w-3.5" aria-hidden /> {tile.label}
            </p>
            <p className={`mt-3 ${tile.big ? 'font-michroma text-3xl tabular-nums' : 'text-sm font-semibold capitalize leading-snug'} ${tile.tone}`}>
              {tile.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 rounded-[24px] border border-accent/10 bg-foreground/5 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-michroma text-sm uppercase tracking-tight">
            {t('panel.attention')}
            {due.length > 0 && <span className="ml-2 rounded-full bg-red-400/20 px-2 py-0.5 text-[11px] text-red-300">{due.length}</span>}
          </h2>
          <button type="button" onClick={onViewSpaces} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-accent hover:text-foreground">
            {t('panel.viewSpaces')} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {measured.length === 0 ? (
          <p className="mt-3 text-sm text-accent">{t('panel.noMeasureYet')}</p>
        ) : due.length === 0 ? (
          <p className="mt-3 text-sm text-emerald-200">{t('panel.allGood')}</p>
        ) : (
          <ul className="mt-4 divide-y divide-accent/10">
            {due.slice(0, 4).map((area) => (
              <li key={area.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{area.label}</span>
                  <span className="text-xs text-red-300">{Math.round(areaPercent(area) ?? 0)}% · {t('panel.bandDue')}</span>
                </span>
                <Link
                  href={`/booking?area=${encodeURIComponent(area.id)}${area.area_type?.service_code ? `&service=${encodeURIComponent(area.area_type.service_code)}` : ''}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-background hover:opacity-90"
                >
                  <Sparkles className="h-3.5 w-3.5" /> {t('panel.rebook')}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
