'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarClock, CheckCircle2, Hourglass, Undo2, XCircle } from 'lucide-react'

import { ChangeRequestDialog } from '@/components/account/ChangeRequestDialog'
import {
  activeAppointment,
  pendingChange,
  type AccountChange,
  type AccountRequest,
  type PropertyArea,
} from '@/components/account/types'
import type { Lang, TranslationKey } from '@/data/i18n'
import { apiRequest } from '@/lib/api-client'
import { canRequestChange } from '@/lib/appointment-change'

type Props = {
  requests: AccountRequest[]
  areas: PropertyArea[]
  lang: Lang
  t: (key: TranslationKey) => string
  onChanged: () => void
}

const STATUS: Record<string, TranslationKey> = {
  new: 'panel.statusNew',
  reviewing: 'panel.statusReviewing',
  quoted: 'panel.statusQuoted',
  approved: 'panel.statusApproved',
  scheduled: 'panel.statusScheduled',
  in_progress: 'panel.statusInProgress',
  completed: 'panel.statusCompleted',
  cancelled: 'panel.statusCancelled',
}

const STATUS_TONE: Record<string, string> = {
  scheduled: 'border-emerald-400/30 text-emerald-200',
  in_progress: 'border-sky-400/30 text-sky-200',
  completed: 'border-accent/20 text-accent',
  cancelled: 'border-red-400/30 text-red-300',
}

const WINDOW: Record<string, TranslationKey> = {
  morning: 'panel.windowMorning',
  afternoon: 'panel.windowAfternoon',
  flexible: 'panel.windowFlexible',
}

const CLOSED = new Set(['completed', 'cancelled'])

export function formatVisit(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
    weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit',
    timeZone: 'America/New_York',
  }).format(new Date(iso))
}

function formatDay(date: string, lang: Lang) {
  // Plain dates are calendar days; anchor at noon UTC so no zone shifts them.
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

/** "Limpiezas": open requests with their confirmed slot and change flow, then history. */
export function CleaningsList({ requests, areas, lang, t, onChanged }: Props) {
  const reduceMotion = useReducedMotion()
  const [changing, setChanging] = useState<AccountRequest | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const areaName = new Map(areas.map((area) => [area.id, area.label]))

  const open = requests.filter((request) => !CLOSED.has(request.status))
  const history = requests.filter((request) => CLOSED.has(request.status))

  async function withdraw(change: AccountChange) {
    setBusy(change.id)
    try {
      await apiRequest(`/api/me/appointment-changes/${change.id}`, { method: 'PATCH', auth: 'required', body: { status: 'withdrawn' } })
      onChanged()
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : 'No fue posible retirar el pedido.')
    } finally {
      setBusy(null)
    }
  }

  function renderRequest(request: AccountRequest, index: number) {
    const appointment = activeAppointment(request)
    const pending = pendingChange(request)
    const lastResolved = request.changes
      ?.filter((change) => change.status === 'approved' || change.status === 'declined')
      .sort((a, b) => (b.resolved_at ?? '').localeCompare(a.resolved_at ?? ''))[0]
    const eligibility = canRequestChange(request.status, appointment?.status === 'scheduled' ? appointment.starts_at : null)
    const covered = (request.areas ?? []).map((row) => areaName.get(row.property_area_id)).filter(Boolean)

    return (
      <motion.li
        key={request.id}
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
        className="rounded-[24px] border border-accent/10 bg-foreground/5 p-5 md:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-michroma text-sm uppercase tracking-tight">{request.service_name_snapshot}</p>
            <p className="mt-1 text-xs text-accent">
              {t('panel.requestReference')} <span className="font-mono">{request.reference_code}</span>
              {request.property ? ` · ${request.property.label || request.property.address}` : ''}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${STATUS_TONE[request.status] ?? 'border-accent/20 text-accent'}`}>
            {t(STATUS[request.status] ?? 'panel.statusNew')}
          </span>
        </div>

        {!CLOSED.has(request.status) && (
          <p className="mt-4 flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            {appointment ? (
              <span><span className="text-accent">{t('panel.confirmedFor')} </span><span className="font-semibold capitalize">{formatVisit(appointment.starts_at, lang)}</span></span>
            ) : request.preferred_date ? (
              <span><span className="text-accent">{t('panel.preferredDate')}: </span><span className="capitalize">{formatDay(request.preferred_date, lang)}</span> · <span className="text-accent">{t('panel.awaitingSchedule')}</span></span>
            ) : (
              <span className="text-accent">{t('panel.awaitingSchedule')}</span>
            )}
          </p>
        )}

        {covered.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-accent/60">{t('panel.coveredSpaces')}</span>
            {covered.map((name) => (
              <span key={name} className="rounded-full bg-foreground/10 px-2.5 py-1 text-[11px] font-medium">{name}</span>
            ))}
          </div>
        )}

        {pending && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4">
            <p className="flex items-start gap-2 text-sm text-amber-100">
              <Hourglass className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                <span className="font-semibold">{t('panel.changePending')}. </span>
                {pending.kind === 'cancel'
                  ? t('panel.changePendingCancel')
                  : t('panel.changePendingMove')
                    .replace('{date}', pending.preferred_date ? formatDay(pending.preferred_date, lang) : '—')
                    .replace('{window}', t(WINDOW[pending.preferred_window ?? 'flexible']))}
              </span>
            </p>
            <button
              type="button"
              onClick={() => void withdraw(pending)}
              disabled={busy === pending.id}
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-100 underline-offset-4 hover:underline disabled:opacity-50"
            >
              <Undo2 className="h-3.5 w-3.5" /> {t('panel.changeWithdraw')}
            </button>
          </div>
        )}

        {!pending && lastResolved && !CLOSED.has(request.status) && (
          <p className={`mt-4 flex items-start gap-2 text-xs ${lastResolved.status === 'approved' ? 'text-emerald-200' : 'text-red-300'}`}>
            {lastResolved.status === 'approved' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0" />}
            <span>
              {lastResolved.status === 'approved' ? t('panel.changeApproved') : t('panel.changeDeclined')}
              {lastResolved.resolution_note ? ` · ${lastResolved.resolution_note}` : ''}
            </span>
          </p>
        )}

        {!pending && !CLOSED.has(request.status) && (
          <div className="mt-4">
            {eligibility.allowed ? (
              <button
                type="button"
                onClick={() => setChanging(request)}
                className="inline-flex items-center gap-2 rounded-xl border border-accent/20 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-accent transition-colors hover:border-accent/50 hover:text-foreground"
              >
                <CalendarClock className="h-3.5 w-3.5" /> {t('panel.requestChange')}
              </button>
            ) : eligibility.reason === 'too-late' ? (
              <p className="text-xs text-accent/70">{t('panel.changeTooLate')}</p>
            ) : null}
          </div>
        )}
      </motion.li>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-[28px] border border-accent/10 bg-foreground/5 p-8 text-center">
        <p className="text-sm font-medium text-accent">{t('panel.requestsEmpty')}</p>
        <Link href="/booking" className="mt-5 inline-block rounded-xl bg-foreground px-6 py-3 text-[10px] font-black uppercase tracking-widest text-background">
          {t('panel.newRequest')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {notice && <p role="status" className="rounded-xl border border-accent/15 bg-foreground/5 p-3 text-sm">{notice}</p>}
      {open.length > 0 && (
        <div>
          <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent">{t('panel.upcoming')}</h3>
          <ul className="space-y-3">{open.map(renderRequest)}</ul>
        </div>
      )}
      {history.length > 0 && (
        <div>
          <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-accent">{t('panel.history')}</h3>
          <ul className="space-y-3 opacity-80">{history.map(renderRequest)}</ul>
        </div>
      )}
      {changing && (
        <ChangeRequestDialog
          request={changing}
          hasAppointment={Boolean(activeAppointment(changing))}
          t={t}
          onClose={() => setChanging(null)}
          onSent={() => {
            setChanging(null)
            setNotice(t('panel.changeSent'))
            onChanged()
          }}
        />
      )}
    </div>
  )
}
