'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, MapPin } from 'lucide-react'

import type { TranslationKey } from '@/data/i18n'

export type PropertyPayload = {
  label: string
  address: string
  city: string
  property_type: string
  access_notes: string
}

type Props = {
  t: (key: TranslationKey) => string
  onSubmit: (payload: PropertyPayload) => Promise<void>
  onCancel?: () => void
}

// Stored values stay in Spanish, matching what /booking already writes.
const TYPES: { value: string; label: TranslationKey }[] = [
  { value: 'Residencial', label: 'panel.ptResidential' },
  { value: 'Condominio', label: 'panel.ptCondo' },
  { value: 'Comercial', label: 'panel.ptCommercial' },
  { value: 'Hospitalidad', label: 'panel.ptHospitality' },
]

const field = 'w-full rounded-xl border border-accent/15 bg-foreground/5 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-accent/30 focus:border-strong'
const labelClass = 'mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-accent'

/** The first thing a new customer does: register where we work. */
export function PropertyForm({ t, onSubmit, onCancel }: Props) {
  const reduceMotion = useReducedMotion()
  const [form, setForm] = useState<PropertyPayload>({
    label: '', address: '', city: 'Miami', property_type: 'Residencial', access_notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const set = (key: keyof PropertyPayload) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  const valid = form.address.trim().length >= 4 && form.city.trim().length >= 2

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    setError('')
    try {
      await onSubmit({ ...form, address: form.address.trim(), city: form.city.trim() })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar la propiedad.')
      setSaving(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="luxury-glass rounded-[28px] border border-accent/10 p-6 md:p-7"
    >
      <div className="mb-6 flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-red-500/10 text-red-300" aria-hidden>
          <MapPin className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-michroma text-base uppercase tracking-tight">{t('panel.addProperty')}</h3>
          <p className="mt-1 text-sm text-accent">{t('panel.propertyIntro')}</p>
        </div>
      </div>
      <fieldset disabled={saving} className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="property-address">{t('panel.propertyAddress')}</label>
          <input id="property-address" className={field} autoComplete="street-address" value={form.address} onChange={set('address')} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="property-city">{t('panel.propertyCity')}</label>
          <input id="property-city" className={field} autoComplete="address-level2" value={form.city} onChange={set('city')} required />
        </div>
        <div>
          <label className={labelClass} htmlFor="property-type">{t('panel.propertyType')}</label>
          <select id="property-type" className={field} value={form.property_type} onChange={set('property_type')}>
            {TYPES.map((type) => <option key={type.value} value={type.value}>{t(type.label)}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="property-label">{t('panel.propertyLabel')}</label>
          <input id="property-label" className={field} value={form.label} onChange={set('label')} />
        </div>
        <div>
          <label className={labelClass} htmlFor="property-access">{t('panel.propertyAccess')}</label>
          <input id="property-access" className={field} value={form.access_notes} onChange={set('access_notes')} placeholder={t('panel.propertyAccessHint')} />
        </div>
      </fieldset>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={!valid || saving}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" /> {t('panel.save')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-accent/20 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:text-foreground"
          >
            {t('panel.cancel')}
          </button>
        )}
      </div>
    </motion.form>
  )
}
