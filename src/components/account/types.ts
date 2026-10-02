import type { Lang } from '@/data/i18n'

export type AreaType = {
  code: string
  name_es: string
  name_en: string
  decay_days: number
  measurement_kind: 'sqft' | 'window_count' | 'unit'
  consumable_categories: string[]
  service_code: string | null
}

export type PropertyArea = {
  id: string
  property_id: string
  area_type_code: string
  label: string
  measurement_value: number | null
  requirements: string | null
  last_cleaned_at: string | null
  created_at: string
  area_type: AreaType | null
}

export type AccountProperty = {
  id: string
  label: string | null
  address: string
  city: string
  property_type: string
  created_at: string
}

export type AccountRequest = {
  id: string
  reference_code: string
  service_name_snapshot: string
  status: string
  preferred_date: string | null
  created_at: string
  property: { id: string; label: string | null; address: string; city: string } | null
}

export type AccountSubscription = {
  id: string
  status: 'pending' | 'active' | 'paused' | 'cancelled'
  cadence_days: number
  next_occurrence_date: string | null
  monthly_value_cents: number
  plan: { id: string; name: string; description: string | null } | null
} | null

export const areaTypeName = (type: AreaType | null, lang: Lang) =>
  type ? (lang === 'en' ? type.name_en : type.name_es) : ''
