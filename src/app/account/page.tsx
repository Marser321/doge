'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, LogOut, Plus } from 'lucide-react'

import { AccountSummary, dueAreas } from '@/components/account/AccountSummary'
import { AreaCard } from '@/components/account/AreaCard'
import { AreaForm, type AreaPayload } from '@/components/account/AreaForm'
import { CleaningsList } from '@/components/account/CleaningsList'
import { PropertyForm, type PropertyPayload } from '@/components/account/PropertyForm'
import { GuideChecklist, type GuideAction } from '@/components/account/guide/GuideChecklist'
import { GuideHelpMenu } from '@/components/account/guide/GuideHelpMenu'
import { GuideTour, type TourStop } from '@/components/account/guide/GuideTour'
import { GuideWelcome } from '@/components/account/guide/GuideWelcome'
import { useGuide } from '@/components/account/guide/useGuide'
import type {
  AccountProperty,
  AccountRequest,
  AccountSubscription,
  AreaType,
  PropertyArea,
} from '@/components/account/types'
import { useLanguage } from '@/components/LanguageProvider'
import type { GuideStep } from '@/lib/guide'
import { getBrowserSupabase } from '@/lib/supabase/client'

type Me = { client_id: string; name: string; email: string | null; locale: 'es' | 'en' }
type Tab = 'home' | 'spaces' | 'requests' | 'membership'

const TABS: Tab[] = ['home', 'spaces', 'requests', 'membership']
const OPEN_REQUEST = new Set(['new', 'reviewing', 'quoted', 'approved', 'scheduled', 'in_progress'])

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'No fue posible cargar tus datos.')
  }
  return response.json() as Promise<T>
}

async function send<T>(url: string, method: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'No fue posible guardar los cambios.')
  return payload as T
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
  const [addingProperty, setAddingProperty] = useState(false)
  const [editing, setEditing] = useState<PropertyArea | null>(null)
  const [tourAt, setTourAt] = useState<number | null>(null)
  const [welcomeDismissed, setWelcomeDismissed] = useState(false)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
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

  const facts = useMemo(() => (loading ? null : {
    properties: properties.length,
    areas: areas.length,
    requests: requests.length,
    hasMembership: Boolean(subscription && subscription.status !== 'cancelled'),
  }), [loading, properties.length, areas.length, requests.length, subscription])
  const guide = useGuide(facts)

  const addArea = useCallback(async (payload: AreaPayload) => {
    const created = await send<PropertyArea>('/api/me/areas', 'POST', {
      property_id: payload.property_id,
      area_type_code: payload.area_type_code,
      label: payload.label,
      measurement_value: payload.measurement_value || null,
      requirements: payload.requirements || null,
    })
    setAreas((prev) => [...prev, created])
    setAdding(false)
  }, [])

  const updateArea = useCallback(async (payload: AreaPayload) => {
    if (!editing) return
    const updated = await send<Partial<PropertyArea>>(`/api/me/areas/${editing.id}`, 'PATCH', {
      label: payload.label,
      measurement_value: payload.measurement_value || null,
      requirements: payload.requirements || null,
    })
    setAreas((prev) => prev.map((area) => (area.id === editing.id ? { ...area, ...updated } : area)))
    setEditing(null)
  }, [editing])

  const addProperty = useCallback(async (payload: PropertyPayload) => {
    const created = await send<AccountProperty>('/api/me/properties', 'POST', payload)
    setProperties((prev) => [...prev, created])
    setAddingProperty(false)
    // The natural next step: describe the first space right away.
    setTab('spaces')
    setAdding(true)
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

  const dueCount = useMemo(() => dueAreas(areas).length, [areas])

  // Each area shows the open request that already covers it, if any.
  const scheduledByArea = useMemo(() => {
    const map = new Map<string, { reference: string }>()
    for (const request of requests) {
      if (!OPEN_REQUEST.has(request.status)) continue
      for (const row of request.areas ?? []) {
        if (!map.has(row.property_area_id)) map.set(row.property_area_id, { reference: request.reference_code })
      }
    }
    return map
  }, [requests])

  const tourStops = useMemo<TourStop[]>(() => [
    { target: 'summary', title: 'tour.summaryTitle', body: 'tour.summaryBody', tab: 'home' },
    { target: 'add-space', title: 'tour.addSpaceTitle', body: 'tour.addSpaceBody', tab: 'spaces' },
    ...(areas.length ? [
      { target: 'meter', title: 'tour.meterTitle', body: 'tour.meterBody', tab: 'spaces' },
      { target: 'schedule', title: 'tour.scheduleTitle', body: 'tour.scheduleBody', tab: 'spaces' },
    ] satisfies TourStop[] : []),
    { target: 'cleanings', title: 'tour.cleaningsTitle', body: 'tour.cleaningsBody', tab: 'requests' },
    { target: 'membership', title: 'tour.membershipTitle', body: 'tour.membershipBody', tab: 'membership' },
    { target: 'help', title: 'tour.helpTitle', body: 'tour.helpBody' },
  ], [areas.length])

  const startTour = useCallback((target?: string) => {
    setAdding(false)
    setEditing(null)
    setAddingProperty(false)
    const index = target ? tourStops.findIndex((stop) => stop.target === target) : 0
    setTourAt(Math.max(0, index))
  }, [tourStops])

  const closeTour = useCallback((finished: boolean) => {
    setTourAt(null)
    setTab('home')
    // Walking the tour to the end is how the cleanliness step gets learned.
    void (finished ? guide.complete('tour', 'cleanliness') : guide.complete('tour'))
  }, [guide])

  const actionFor = useCallback((step: GuideStep): GuideAction => {
    switch (step) {
      case 'property':
        return { kind: 'callback', label: 'guide.doIt', run: () => { setTab('spaces'); setAddingProperty(true) } }
      case 'space':
        return { kind: 'callback', label: 'guide.doIt', run: () => { setTab('spaces'); setAdding(true) } }
      case 'cleanliness':
        return areas.length
          ? { kind: 'callback', label: 'guide.showMe', run: () => startTour('meter') }
          : { kind: 'callback', label: 'guide.gotIt', run: () => void guide.complete('cleanliness') }
      case 'schedule':
        return areas.length
          ? { kind: 'callback', label: 'guide.showMe', run: () => startTour('schedule') }
          : { kind: 'link', label: 'guide.doIt', href: '/booking' }
      case 'membership':
        return { kind: 'link', label: 'guide.doIt', href: '/membership' }
    }
  }, [areas.length, guide, startTour])

  const tabLabel: Record<Tab, string> = {
    home: t('panel.tabHome'),
    spaces: t('panel.tabSpaces'),
    requests: t('panel.tabRequests'),
    membership: t('panel.tabMembership'),
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <p className="text-sm font-medium text-accent">{t('panel.loading')}</p>
      </main>
    )
  }

  const showGuide = guide.loaded && guide.enabled
  const showWelcome = showGuide && !guide.progress.tour && !welcomeDismissed && tourAt === null && !error

  return (
    <main className="min-h-screen font-sans text-foreground">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-7">
        <Link href="/" className="inline-flex items-center gap-2 text-accent transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{lang === 'es' ? 'Inicio' : 'Home'}</span>
        </Link>
        <div className="flex items-center gap-6">
          {guide.loaded && (
            <GuideHelpMenu
              enabled={guide.enabled}
              t={t}
              onToggle={(value) => void guide.setEnabled(value)}
              onStartTour={() => startTour()}
              onRestart={() => { setWelcomeDismissed(false); void guide.restart() }}
            />
          )}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t('account.logout')}</span>
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 pb-28">
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

        <div role="tablist" aria-label={t('account.title2')} className="mb-10 flex gap-2 overflow-x-auto border-b border-accent/10 pb-4">
          {TABS.map((id) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                tab === id ? 'bg-foreground text-background' : 'text-accent hover:text-foreground'
              }`}
            >
              {tabLabel[id]}
              {id === 'spaces' && dueCount > 0 && (
                <span className="ml-2 rounded-full bg-red-400/20 px-1.5 text-red-300">{dueCount}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'home' && (
          <>
            {showGuide && (
              <GuideChecklist
                steps={guide.steps}
                next={guide.next}
                completion={guide.completion}
                t={t}
                actionFor={actionFor}
                onHide={() => void guide.setEnabled(false)}
              />
            )}
            <AccountSummary
              areas={areas}
              requests={requests}
              subscription={subscription}
              lang={lang}
              t={t}
              onViewSpaces={() => setTab('spaces')}
            />
          </>
        )}

        {tab === 'spaces' && (
          <section aria-label={t('panel.tabSpaces')}>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-michroma text-xl uppercase tracking-tight">{t('panel.cleanliness')}</h2>
                <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-accent">{t('panel.cleanlinessHint')}</p>
              </div>
              {!adding && !editing && !addingProperty && (
                <div className="flex flex-wrap gap-2">
                  {properties.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAddingProperty(true)}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent/70 transition-colors hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" /> {t('panel.addProperty')}
                    </button>
                  )}
                  <button
                    type="button"
                    data-guide="add-space"
                    onClick={() => (properties.length ? setAdding(true) : setAddingProperty(true))}
                    className="inline-flex items-center gap-2 rounded-xl border border-accent/20 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:border-accent/50 hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" /> {properties.length ? t('panel.addSpace') : t('panel.addProperty')}
                  </button>
                </div>
              )}
            </div>

            {addingProperty || properties.length === 0 ? (
              <PropertyForm
                t={t}
                onSubmit={addProperty}
                onCancel={properties.length ? () => setAddingProperty(false) : undefined}
              />
            ) : (
              <>
                {(adding || editing) && (
                  <div className="mb-6">
                    <AreaForm
                      key={editing?.id ?? 'new'}
                      areaTypes={areaTypes}
                      properties={properties}
                      lang={lang}
                      t={t}
                      editing={editing ?? undefined}
                      onCancel={() => { setAdding(false); setEditing(null) }}
                      onSubmit={editing ? updateArea : addArea}
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
                      <AreaCard
                        key={area.id}
                        area={area}
                        lang={lang}
                        t={t}
                        index={index}
                        onRemove={removeArea}
                        onEdit={(target) => { setAdding(false); setEditing(target) }}
                        showTips={showGuide}
                        scheduled={scheduledByArea.get(area.id) ?? null}
                        guideAnchor={index === 0}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {tab === 'requests' && (
          <section aria-label={t('panel.tabRequests')} data-guide="cleanings">
            <CleaningsList requests={requests} areas={areas} lang={lang} t={t} onChanged={() => void load(true)} />
          </section>
        )}

        {tab === 'membership' && (
          <section aria-label={t('panel.tabMembership')} data-guide="membership">
            {subscription ? (
              <div className="rounded-[28px] border border-accent/10 bg-foreground/5 p-8">
                <p className="font-michroma text-2xl uppercase tracking-tight">{subscription.plan?.name ?? '—'}</p>
                {subscription.plan?.description && <p className="mt-2 max-w-lg text-sm text-accent">{subscription.plan.description}</p>}
                <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{t('panel.membershipStatus')}</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {subscription.status === 'active' ? t('panel.membershipActive')
                        : subscription.status === 'paused' ? t('panel.membershipPaused')
                          : subscription.status === 'cancelled' ? t('panel.membershipCancelled')
                            : t('panel.membershipPending')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{t('panel.membershipCadence')}</dt>
                    <dd className="mt-1 text-sm text-foreground">{t('panel.membershipEvery').replace('{n}', String(subscription.cadence_days))}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{t('panel.membershipValue')}</dt>
                    <dd className="mt-1 text-sm text-foreground">
                      {new Intl.NumberFormat(lang === 'es' ? 'es-US' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                        .format(subscription.monthly_value_cents / 100)}
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
              <div className="rounded-[28px] border border-accent/10 bg-foreground/5 p-8">
                <p className="max-w-md text-sm font-medium leading-relaxed text-accent">{t('panel.membershipNone')}</p>
                <h3 className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-accent">{t('panel.membershipHowTitle')}</h3>
                <ol className="mt-3 space-y-2">
                  {(['panel.membershipHow1', 'panel.membershipHow2', 'panel.membershipHow3'] as const).map((key, position) => (
                    <li key={key} className="flex items-start gap-3 text-sm">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground/10 text-[11px] font-black">{position + 1}</span>
                      {t(key)}
                    </li>
                  ))}
                </ol>
                <Link href="/membership" className="mt-6 inline-block rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background">
                  {t('panel.membershipCta')}
                </Link>
              </div>
            )}
          </section>
        )}
      </div>

      {showWelcome && (
        <GuideWelcome
          name={me?.name ?? ''}
          t={t}
          onStart={() => { setWelcomeDismissed(true); startTour() }}
          onLater={() => setWelcomeDismissed(true)}
        />
      )}
      {tourAt !== null && (
        <GuideTour
          stops={tourStops}
          startAt={tourAt}
          t={t}
          onStop={(stop) => { if (stop.tab) setTab(stop.tab as Tab) }}
          onClose={closeTour}
        />
      )}
    </main>
  )
}
