'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, LogOut, Plus } from 'lucide-react'

import { AreaCard } from '@/components/account/AreaCard'
import { AreaForm } from '@/components/account/AreaForm'
import type {
  AccountProperty,
  AccountRequest,
  AccountSubscription,
  AreaType,
  PropertyArea,
} from '@/components/account/types'
import { useLanguage } from '@/components/LanguageProvider'
import { getBrowserSupabase } from '@/lib/supabase/client'

type Me = { client_id: string; name: string; email: string | null; locale: 'es' | 'en' }
type Tab = 'home' | 'spaces' | 'requests' | 'membership'

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'No fue posible cargar tus datos.')
  }
  return response.json() as Promise<T>
}

export default function AccountPage() {
  const { lang, t } = useLanguage()
  const router = useRouter()
  const reduceMotion = useReducedMotion()

  const [tab, setTab] = useState<Tab>('home')
  const [me, setMe] = useState<Me | null>(null)
  const [areas, setAreas] = useState<PropertyArea[]>([])
  const [areaTypes, setAreaTypes] = useState<AreaType[]>([])
  const [properties, setProperties] = useState<AccountProperty[]>([])
  const [requests, setRequests] = useState<AccountRequest[]>([])
  const [subscription, setSubscription] = useState<AccountSubscription>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [profile, areaList, propertyList, requestList, sub, types] = await Promise.all([
        getJson<Me>('/api/me'),
        getJson<PropertyArea[]>('/api/me/areas'),
        getJson<AccountProperty[]>('/api/me/properties'),
        getJson<AccountRequest[]>('/api/me/requests'),
        getJson<AccountSubscription>('/api/me/subscription'),
        getJson<AreaType[]>('/api/catalog/area-types'),
      ])
      setMe(profile)
      setAreas(areaList)
      setProperties(propertyList)
      setRequests(requestList)
      setSubscription(sub)
      setAreaTypes(types)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar tu cuenta.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const addArea = useCallback(async (payload: Parameters<Parameters<typeof AreaForm>[0]['onSubmit']>[0]) => {
    const response = await fetch('/api/me/areas', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_id: payload.property_id,
        area_type_code: payload.area_type_code,
        label: payload.label,
        measurement_value: payload.measurement_value || null,
        requirements: payload.requirements || null,
      }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'No fue posible guardar el espacio.')
    setAreas((prev) => [...prev, body as PropertyArea])
    setAdding(false)
  }, [])

  const removeArea = useCallback(async (id: string) => {
    const previous = areas
    setAreas((prev) => prev.filter((area) => area.id !== id))
    const response = await fetch(`/api/me/areas/${id}`, { method: 'DELETE', credentials: 'same-origin' })
    // Restore the optimistic removal if the server refused it.
    if (!response.ok) setAreas(previous)
  }, [areas])

  const logout = useCallback(async () => {
    await getBrowserSupabase().auth.signOut()
    router.replace('/')
    router.refresh()
  }, [router])

  const dueCount = useMemo(
    () => areas.filter((area) => {
      const decay = area.area_type?.decay_days ?? 30
      if (!area.last_cleaned_at) return false
      const elapsed = (Date.now() - new Date(area.last_cleaned_at).getTime()) / 86_400_000
      return 100 - (elapsed / decay) * 100 <= 30
    }).length,
    [areas],
  )

  const TABS: { id: Tab; label: string }[] = [
    { id: 'home', label: t('panel.tabHome') },
    { id: 'spaces', label: t('panel.tabSpaces') },
    { id: 'requests', label: t('panel.tabRequests') },
    { id: 'membership', label: t('panel.tabMembership') },
  ]

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <p className="text-sm font-medium text-accent">{t('panel.loading')}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-7">
        <Link href="/" className="inline-flex items-center gap-2 text-accent transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{lang === 'es' ? 'Inicio' : 'Home'}</span>
        </Link>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent transition-colors hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> {t('account.logout')}
        </button>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">{t('panel.greeting')}</p>
          <h1 className="mt-3 font-michroma text-3xl uppercase tracking-tighter md:text-5xl">{me?.name}</h1>
        </motion.header>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-300">{error}</p>
            <button type="button" onClick={() => void load()} className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-200 underline">
              {t('panel.retry')}
            </button>
          </div>
        )}

        <div role="tablist" aria-label={t('account.title2')} className="mb-10 flex flex-wrap gap-2 border-b border-accent/10 pb-4">
          {TABS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === item.id ? 'bg-foreground text-background' : 'text-accent hover:text-foreground'
              }`}
            >
              {item.label}
              {item.id === 'home' && dueCount > 0 && (
                <span className="ml-2 rounded-full bg-red-400/20 px-1.5 text-red-300">{dueCount}</span>
              )}
            </button>
          ))}
        </div>

        {(tab === 'home' || tab === 'spaces') && (
          <section aria-label={t('panel.tabSpaces')}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-michroma text-xl uppercase tracking-tight">{t('panel.cleanliness')}</h2>
                <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-accent">{t('panel.cleanlinessHint')}</p>
              </div>
              {properties.length > 0 && !adding && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-accent/20 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:border-accent/50 hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" /> {t('panel.addSpace')}
                </button>
              )}
            </div>

            {properties.length === 0 ? (
              <div className="rounded-[28px] border border-accent/10 bg-foreground/5 p-8 text-center">
                <p className="text-sm font-medium text-accent">{t('panel.noProperty')}</p>
                <Link href="/booking" className="mt-5 inline-block rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background">
                  {t('panel.newRequest')}
                </Link>
              </div>
            ) : (
              <>
                {adding && (
                  <div className="mb-6">
                    <AreaForm
                      areaTypes={areaTypes}
                      properties={properties}
                      lang={lang}
                      t={t}
                      onCancel={() => setAdding(false)}
                      onSubmit={addArea}
                    />
                  </div>
                )}

                {areas.length === 0 && !adding ? (
                  <p className="rounded-[28px] border border-accent/10 bg-foreground/5 p-8 text-center text-sm font-medium text-accent">
                    {t('panel.spacesEmpty')}
                  </p>
                ) : (
                  <div className="grid gap-5 md:grid-cols-2">
                    {areas.map((area, index) => (
                      <AreaCard key={area.id} area={area} lang={lang} t={t} onRemove={removeArea} index={index} />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {tab === 'requests' && (
          <section aria-label={t('panel.tabRequests')}>
            {requests.length === 0 ? (
              <div className="rounded-[28px] border border-accent/10 bg-foreground/5 p-8 text-center">
                <p className="text-sm font-medium text-accent">{t('panel.requestsEmpty')}</p>
                <Link href="/booking" className="mt-5 inline-block rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background">
                  {t('panel.newRequest')}
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {requests.map((request) => (
                  <li key={request.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/10 bg-foreground/5 p-5">
                    <div className="min-w-0">
                      <p className="font-michroma text-sm uppercase tracking-tight">{request.service_name_snapshot}</p>
                      <p className="mt-1 text-xs text-accent">
                        {t('panel.requestReference')} <span className="font-mono">{request.reference_code}</span>
                      </p>
                    </div>
                    <span className="rounded-full border border-accent/20 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-accent">
                      {request.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'membership' && (
          <section aria-label={t('panel.tabMembership')}>
            {subscription ? (
              <div className="rounded-[28px] border border-accent/10 bg-foreground/5 p-8">
                <p className="font-michroma text-2xl uppercase tracking-tight">{subscription.plan?.name ?? '—'}</p>
                <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{t('panel.membershipStatus')}</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {subscription.status === 'active' ? t('panel.membershipActive')
                        : subscription.status === 'paused' ? t('panel.membershipPaused')
                          : subscription.status === 'cancelled' ? t('panel.membershipCancelled')
                            : t('panel.membershipPending')}
                    </dd>
                  </div>
                  {subscription.next_occurrence_date && (
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{t('panel.membershipNext')}</dt>
                      <dd className="mt-1 text-sm text-foreground">{subscription.next_occurrence_date}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <div className="rounded-[28px] border border-accent/10 bg-foreground/5 p-8 text-center">
                <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-accent">{t('panel.membershipNone')}</p>
                <Link href="/membership" className="mt-6 inline-block rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background">
                  {t('panel.membershipCta')}
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
