'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { CalendarClock, Info, Pencil, ShoppingBag, Sparkles, Trash2 } from 'lucide-react'

import { CleanlinessMeter } from '@/components/account/CleanlinessMeter'
import { areaTypeName, type PropertyArea } from '@/components/account/types'
import { STORE_DEPARTMENTS } from '@/content/store-taxonomy'
import { cleanlinessBand, cleanlinessPercent, daysSinceCleaned } from '@/lib/cleanliness'
import type { Lang, TranslationKey } from '@/data/i18n'

type Props = {
  area: PropertyArea
  lang: Lang
  t: (key: TranslationKey) => string
  onRemove: (id: string) => void
  onEdit: (area: PropertyArea) => void
  index: number
  /** Show the "what does this mean" line under the meter. */
  showTips: boolean
  /** Open request covering this area, if any. */
  scheduled?: { reference: string } | null
  /** First card carries the tour anchors. */
  guideAnchor?: boolean
}

/** Maps a consumable slug to the department that holds it, for a /store link. */
function departmentFor(slug: string) {
  return STORE_DEPARTMENTS.find((department) =>
    department.id === slug || department.subcategories.some((sub) => sub.id === slug),
  )
}

export function AreaCard({ area, lang, t, onRemove, onEdit, index, showTips, scheduled, guideAnchor }: Props) {
  const reduceMotion = useReducedMotion()
  const decayDays = area.area_type?.decay_days ?? 30
  const percent = cleanlinessPercent(area.last_cleaned_at, decayDays)
  const band = cleanlinessBand(percent)
  const days = daysSinceCleaned(area.last_cleaned_at)

  const bandLabel = band === 'fresh'
    ? t('panel.bandFresh')
    : band === 'fading'
      ? t('panel.bandFading')
      : band === 'due'
        ? t('panel.bandDue')
        : t('panel.neverCleaned')

  const tip = band === 'fresh'
    ? t('panel.meterHelpFresh')
    : band === 'fading'
      ? t('panel.meterHelpFading')
      : band === 'due'
        ? t('panel.meterHelpDue')
        : t('panel.meterHelpNever')

  const scheduleHref = `/booking?area=${encodeURIComponent(area.id)}${area.area_type?.service_code ? `&service=${encodeURIComponent(area.area_type.service_code)}` : ''}`

  const since = days === null
    ? t('panel.neverCleaned')
    : days === 0
      ? t('panel.cleanedToday')
      : t('panel.cleanedDaysAgo').replace('{n}', String(days))

  const consumables = (area.area_type?.consumable_categories ?? [])
    .map((slug) => ({ slug, department: departmentFor(slug) }))
    .filter((entry): entry is { slug: string; department: NonNullable<ReturnType<typeof departmentFor>> } => Boolean(entry.department))
    .slice(0, 3)

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.6, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="luxury-glass rounded-[28px] border border-accent/10 p-6 md:p-7 flex flex-col gap-5"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-michroma text-lg uppercase tracking-tight text-foreground truncate">{area.label}</h3>
          <p className="mt-1 text-xs font-medium text-accent">
            {areaTypeName(area.area_type, lang)}
            {area.measurement_value ? ` · ${area.measurement_value}${area.area_type?.measurement_kind === 'sqft' ? ' ft²' : ''}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => onEdit(area)}
            aria-label={`${t('panel.edit')} ${area.label}`}
            className="rounded-lg p-2 text-accent/50 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { if (window.confirm(t('panel.confirmRemove'))) onRemove(area.id) }}
            aria-label={`${t('panel.remove')} ${area.label}`}
            className="rounded-lg p-2 text-accent/50 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div data-guide={guideAnchor ? 'meter' : undefined}>
        <CleanlinessMeter percent={percent} label={bandLabel} />
        <p className="mt-2 text-xs font-medium text-accent/70">{since}</p>
        {showTips && (
          <p className="mt-3 flex gap-2 text-xs leading-relaxed text-accent">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {tip}
          </p>
        )}
      </div>

      {area.requirements && (
        <p className="rounded-xl border border-accent/10 bg-foreground/5 p-3 text-xs leading-relaxed text-accent">
          {area.requirements}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {scheduled ? (
          <span data-guide={guideAnchor ? 'schedule' : undefined} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-200">
            <CalendarClock className="h-3.5 w-3.5" /> {scheduled.reference}
          </span>
        ) : (
          <Link
            href={scheduleHref}
            data-guide={guideAnchor ? 'schedule' : undefined}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" /> {t('panel.rebook')}
          </Link>
        )}
        {consumables.map(({ slug, department }) => (
          <Link
            key={slug}
            href={`/store?dept=${department.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/20 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:border-accent/50 hover:text-foreground"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> {department.label[lang]}
          </Link>
        ))}
      </div>
    </motion.article>
  )
}
