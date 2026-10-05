'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Briefcase,
  Car,
  Check,
  ChefHat,
  LayoutGrid,
  Sofa,
  Store,
  Trees,
  type LucideIcon,
} from 'lucide-react'

import type { AccountProperty, AreaType, PropertyArea } from '@/components/account/types'
import type { Lang, TranslationKey } from '@/data/i18n'

export type AreaPayload = {
  property_id: string
  area_type_code: string
  label: string
  measurement_value: string
  requirements: string
}

type Props = {
  areaTypes: AreaType[]
  properties: AccountProperty[]
  lang: Lang
  t: (key: TranslationKey) => string
  onCancel: () => void
  onSubmit: (payload: AreaPayload) => Promise<void>
  /** Edit mode: the type is fixed, so the wizard starts at the size step. */
  editing?: PropertyArea
}

const ICONS: Record<string, LucideIcon> = {
  kitchen: ChefHat,
  bathroom: Bath,
  bedroom: BedDouble,
  living: Sofa,
  'window-wall': AppWindow,
  office: Briefcase,
  retail: Store,
  outdoor: Trees,
  garage: Car,
}

const field = 'w-full rounded-xl border border-accent/15 bg-foreground/5 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-accent/30 focus:border-strong'
const labelClass = 'mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-accent'
const primary = 'inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40'
const secondary = 'inline-flex items-center gap-2 rounded-xl border border-accent/20 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:text-foreground'

type Step = 0 | 1 | 2

/**
 * Three-step space wizard: pick a type from visual cards, give an optional
 * size with a hint for that kind of space, then name it. The name is
 * pre-filled from the type so the fastest path is three clicks.
 */
export function AreaForm({ areaTypes, properties, lang, t, onCancel, onSubmit, editing }: Props) {
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState<Step>(editing ? 1 : 0)
  const [direction, setDirection] = useState(1)
  const [propertyId, setPropertyId] = useState(editing?.property_id ?? properties[0]?.id ?? '')
  const [typeCode, setTypeCode] = useState(editing?.area_type_code ?? '')
  const [label, setLabel] = useState(editing?.label ?? '')
  const [labelTouched, setLabelTouched] = useState(Boolean(editing))
  const [measurement, setMeasurement] = useState(editing?.measurement_value ? String(editing.measurement_value) : '')
  const [requirements, setRequirements] = useState(editing?.requirements ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedType = areaTypes.find((type) => type.code === typeCode) ?? editing?.area_type ?? undefined
  const typeName = (type: AreaType | undefined) => (type ? (lang === 'en' ? type.name_en : type.name_es) : '')
  const measurementLabel = selectedType?.measurement_kind === 'window_count'
    ? t('panel.spaceMeasureWindows')
    : selectedType?.measurement_kind === 'unit'
      ? t('panel.spaceMeasureUnit')
      : t('panel.spaceMeasureSqft')
  const measurementHint = selectedType?.measurement_kind === 'window_count'
    ? t('panel.wizardSizeHintWindows')
    : selectedType?.measurement_kind === 'unit'
      ? t('panel.wizardSizeHintUnit')
      : t('panel.wizardSizeHintSqft')
  const measurementValid = measurement === '' || Number(measurement) > 0

  const firstStep: Step = editing ? 1 : 0
  const steps: { id: Step; label: TranslationKey }[] = [
    { id: 0, label: 'panel.wizardStepType' },
    { id: 1, label: 'panel.wizardStepSize' },
    { id: 2, label: 'panel.wizardStepDetails' },
  ]

  function goTo(next: Step) {
    setDirection(next > step ? 1 : -1)
    setStep(next)
    setError('')
  }

  function pickType(code: string) {
    setTypeCode(code)
    // Suggest a name until the customer writes their own.
    if (!labelTouched) setLabel(typeName(areaTypes.find((type) => type.code === code)))
    setDirection(1)
    setStep(1)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (step !== 2) {
      if (step === 1 && measurementValid) goTo(2)
      return
    }
    if (!propertyId || !typeCode || !label.trim() || saving) return
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        property_id: propertyId,
        area_type_code: typeCode,
        label: label.trim(),
        measurement_value: measurement,
        requirements: requirements.trim(),
      })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar el espacio.')
      setSaving(false)
    }
  }

  const slide = reduceMotion
    ? {}
    : {
      initial: { opacity: 0, x: 24 * direction },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -24 * direction },
      transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
    }

  return (
    <form onSubmit={handleSubmit} className="luxury-glass overflow-hidden rounded-[28px] border border-accent/10 p-6 md:p-7">
      {editing && <p className="mb-4 font-michroma text-sm uppercase tracking-tight">{t('panel.editSpace')}</p>}

      {/* Progress */}
      <ol className="mb-7 flex items-center gap-2" aria-label={t('panel.addSpace')}>
        {steps.filter((item) => item.id >= firstStep).map((item, position, visible) => {
          const done = item.id < step
          const current = item.id === step
          return (
            <li key={item.id} className="flex flex-1 items-center gap-2" aria-current={current ? 'step' : undefined}>
              <span
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-black transition-colors ${
                  done ? 'bg-emerald-400/20 text-emerald-300' : current ? 'bg-foreground text-background' : 'bg-foreground/10 text-accent'
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : position + 1}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${current ? 'text-foreground' : 'text-accent/60'}`}>
                {t(item.label)}
              </span>
              {position < visible.length - 1 && (
                <span className="h-px flex-1 bg-accent/15">
                  <motion.span
                    className="block h-px bg-foreground/60"
                    initial={false}
                    animate={{ width: done ? '100%' : '0%' }}
                    transition={{ duration: reduceMotion ? 0 : 0.4 }}
                  />
                </span>
              )}
            </li>
          )
        })}
      </ol>

      <fieldset disabled={saving} className="min-h-[15rem]">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 && (
            <motion.div key="type" {...slide}>
              <h3 className="mb-4 font-michroma text-base uppercase tracking-tight">{t('panel.wizardTypeQuestion')}</h3>
              {properties.length > 1 && (
                <div className="mb-5">
                  <label className={labelClass} htmlFor="area-property">{t('panel.spaceProperty')}</label>
                  <select id="area-property" className={field} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>{property.label || property.address}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t('panel.spaceType')}>
                {areaTypes.map((type) => {
                  const Icon = ICONS[type.code] ?? LayoutGrid
                  const active = type.code === typeCode
                  return (
                    <button
                      key={type.code}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => pickType(type.code)}
                      className={`group flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 ${
                        active ? 'border-red-400/60 bg-red-500/10' : 'border-accent/10 bg-foreground/5 hover:border-accent/30'
                      }`}
                    >
                      <Icon className={`h-6 w-6 transition-colors ${active ? 'text-red-300' : 'text-accent group-hover:text-foreground'}`} />
                      <span>
                        <span className="block text-sm font-semibold text-foreground">{typeName(type)}</span>
                        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-widest text-accent/60">
                          {t('panel.everyNDays').replace('{n}', String(type.decay_days))}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="size" {...slide}>
              <h3 className="mb-1 font-michroma text-base uppercase tracking-tight">{t('panel.wizardSizeQuestion')}</h3>
              <p className="mb-5 text-sm text-accent">{measurementHint}</p>
              <label className={labelClass} htmlFor="area-measure">{measurementLabel}</label>
              <input
                id="area-measure"
                className={`${field} max-w-xs text-lg`}
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                autoFocus
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
                aria-invalid={!measurementValid}
              />
              <p className="mt-2 text-xs text-accent/60">{t('panel.wizardSizeOptional')}</p>
              {selectedType && (
                <p className="mt-6 rounded-xl border border-accent/10 bg-foreground/5 p-3 text-xs leading-relaxed text-accent">
                  {t('panel.wizardCycle').replace('{n}', String(selectedType.decay_days))}
                </p>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="details" {...slide} className="grid gap-5">
              <h3 className="font-michroma text-base uppercase tracking-tight">{t('panel.wizardDetailsQuestion')}</h3>
              <div>
                <label className={labelClass} htmlFor="area-label">{t('panel.spaceName')}</label>
                <input
                  id="area-label"
                  className={field}
                  value={label}
                  autoFocus
                  onChange={(e) => { setLabel(e.target.value); setLabelTouched(true) }}
                  placeholder={t('panel.spaceNameHint')}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="area-req">{t('panel.spaceRequirements')}</label>
                <textarea
                  id="area-req"
                  className={`${field} resize-none`}
                  rows={3}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder={t('panel.spaceRequirementsHint')}
                />
              </div>
              <p className="text-xs text-accent">
                {typeName(selectedType)}
                {measurement ? ` · ${measurement}${selectedType?.measurement_kind === 'sqft' ? ' ft²' : ''}` : ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </fieldset>

      {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={step === firstStep ? onCancel : () => goTo((step - 1) as Step)} className={secondary}>
          {step === firstStep ? t('panel.cancel') : <><ArrowLeft className="h-3.5 w-3.5" /> {t('panel.back')}</>}
        </button>
        {step === 1 && (
          <button type="submit" disabled={!measurementValid} className={primary}>
            {t('panel.next')} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
        {step === 2 && (
          <button type="submit" disabled={!label.trim() || saving} className={primary}>
            <Check className="h-3.5 w-3.5" /> {t('panel.save')}
          </button>
        )}
      </div>
    </form>
  )
}
