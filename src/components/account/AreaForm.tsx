'use client'

import { useState } from 'react'

import type { AccountProperty, AreaType } from '@/components/account/types'
import type { Lang, TranslationKey } from '@/data/i18n'

type Props = {
  areaTypes: AreaType[]
  properties: AccountProperty[]
  lang: Lang
  t: (key: TranslationKey) => string
  onCancel: () => void
  onSubmit: (payload: {
    property_id: string
    area_type_code: string
    label: string
    measurement_value: string
    requirements: string
  }) => Promise<void>
}

const field = 'w-full rounded-xl border border-accent/15 bg-foreground/5 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-accent/30 focus:border-strong'
const labelClass = 'mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-accent'

export function AreaForm({ areaTypes, properties, lang, t, onCancel, onSubmit }: Props) {
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '')
  const [typeCode, setTypeCode] = useState(areaTypes[0]?.code ?? '')
  const [label, setLabel] = useState('')
  const [measurement, setMeasurement] = useState('')
  const [requirements, setRequirements] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const selectedType = areaTypes.find((type) => type.code === typeCode)
  const measurementLabel = selectedType?.measurement_kind === 'window_count'
    ? t('panel.spaceMeasureWindows')
    : selectedType?.measurement_kind === 'unit'
      ? t('panel.spaceMeasureUnit')
      : t('panel.spaceMeasureSqft')

  const valid = propertyId && typeCode && label.trim()

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!valid || saving) return
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

  return (
    <form onSubmit={handleSubmit} className="luxury-glass rounded-[28px] border border-accent/10 p-6 md:p-7">
      <fieldset disabled={saving} className="contents">
        <div className="grid gap-5 sm:grid-cols-2">
          {properties.length > 1 && (
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="area-property">{t('panel.spaceProperty')}</label>
              <select id="area-property" className={field} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.label || property.address}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass} htmlFor="area-type">{t('panel.spaceType')}</label>
            <select id="area-type" className={field} value={typeCode} onChange={(e) => setTypeCode(e.target.value)}>
              {areaTypes.map((type) => (
                <option key={type.code} value={type.code}>
                  {lang === 'en' ? type.name_en : type.name_es}
                </option>
              ))}
            </select>
            {selectedType && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-accent/50">
                {t('panel.everyNDays').replace('{n}', String(selectedType.decay_days))}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="area-measure">{measurementLabel}</label>
            <input
              id="area-measure"
              className={field}
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              value={measurement}
              onChange={(e) => setMeasurement(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="area-label">{t('panel.spaceName')}</label>
            <input
              id="area-label"
              className={field}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t('panel.spaceNameHint')}
              required
            />
          </div>

          <div className="sm:col-span-2">
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
        </div>

        {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={!valid || saving}
            className="rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('panel.save')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-accent/20 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:text-foreground"
          >
            {t('panel.cancel')}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
