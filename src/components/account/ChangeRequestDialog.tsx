'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarClock, CalendarX, Send, X } from 'lucide-react'

import type { AccountRequest } from '@/components/account/types'
import type { TranslationKey } from '@/data/i18n'
import { apiRequest } from '@/lib/api-client'
import { CHANGE_WINDOWS, earliestChangeDate, validateChangeInput, type ChangeWindow } from '@/lib/appointment-change'

type Props = {
  request: AccountRequest
  hasAppointment: boolean
  t: (key: TranslationKey) => string
  onClose: () => void
  onSent: () => void
}

const WINDOW_LABEL: Record<ChangeWindow, TranslationKey> = {
  morning: 'panel.windowMorning',
  afternoon: 'panel.windowAfternoon',
  flexible: 'panel.windowFlexible',
}

const field = 'w-full rounded-xl border border-accent/15 bg-foreground/5 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-strong'
const labelClass = 'mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-accent'

/** Customer asks dispatch to move or cancel a visit. Nothing is booked here. */
export function ChangeRequestDialog({ request, hasAppointment, t, onClose, onSent }: Props) {
  const reduceMotion = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'move' | 'cancel'>('move')
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState<ChangeWindow>('flexible')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const minDate = earliestChangeDate()

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>('button, input')?.focus()
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const kind = mode === 'cancel' ? 'cancel' : hasAppointment ? 'reschedule' : 'schedule'
    const invalid = validateChangeInput({ kind, preferredDate: date, preferredWindow: slot, reason })
    if (invalid) { setError(invalid); return }
    setSaving(true)
    setError('')
    try {
      await apiRequest('/api/me/appointment-changes', {
        method: 'POST',
        auth: 'required',
        body: {
          request_id: request.id,
          kind,
          preferred_date: mode === 'cancel' ? null : date,
          preferred_window: mode === 'cancel' ? null : slot,
          reason: reason.trim() || null,
        },
      })
      onSent()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible enviar el pedido.')
      setSaving(false)
    }
  }

  if (typeof document === 'undefined') return null

  const modeButton = (value: 'move' | 'cancel', Icon: typeof CalendarClock, label: TranslationKey) => (
    <button
      type="button"
      role="radio"
      aria-checked={mode === value}
      onClick={() => { setMode(value); setError('') }}
      className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
        mode === value ? 'border-red-400/60 bg-red-500/10 text-foreground' : 'border-accent/15 text-accent hover:text-foreground'
      }`}
    >
      <Icon className="h-4 w-4" /> {t(label)}
    </button>
  )

  return createPortal(
    <div className="fixed inset-0 z-[1000] grid place-items-end p-0 sm:place-items-center sm:p-4">
      <motion.div
        className="absolute inset-0 bg-[rgba(5,5,8,0.72)] backdrop-blur-sm"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-title"
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] border border-accent/15 bg-background p-6 text-foreground shadow-2xl sm:max-w-lg sm:rounded-[28px] sm:p-7"
        initial={reduceMotion ? false : { opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="change-title" className="font-michroma text-lg uppercase tracking-tight">{t('panel.changeTitle')}</h2>
            <p className="mt-1 text-xs text-accent">
              {request.service_name_snapshot} · <span className="font-mono">{request.reference_code}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label={t('panel.close')} className="rounded-lg p-1 text-accent hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-accent">{t('panel.changeIntro')}</p>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <fieldset disabled={saving} className="space-y-5">
            <div className="flex gap-2" role="radiogroup" aria-label={t('panel.changeTitle')}>
              {modeButton('move', CalendarClock, 'panel.changeKindMove')}
              {modeButton('cancel', CalendarX, 'panel.changeKindCancel')}
            </div>

            {mode === 'move' && (
              <>
                <div>
                  <label className={labelClass} htmlFor="change-date">{t('panel.changeDate')}</label>
                  <input id="change-date" type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className={field} required />
                </div>
                <div>
                  <span className={labelClass}>{t('panel.changeWindow')}</span>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('panel.changeWindow')}>
                    {CHANGE_WINDOWS.map((value) => (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={slot === value}
                        onClick={() => setSlot(value)}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                          slot === value ? 'border-foreground bg-foreground text-background' : 'border-accent/20 text-accent hover:text-foreground'
                        }`}
                      >
                        {t(WINDOW_LABEL[value])}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className={labelClass} htmlFor="change-reason">
                {mode === 'cancel' ? t('panel.changeReason') : t('panel.changeReasonOptional')}
              </label>
              <textarea
                id="change-reason"
                rows={3}
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`${field} resize-none`}
                required={mode === 'cancel'}
              />
            </div>
          </fieldset>

          <p className="text-xs text-accent/70">{t('panel.changeRule')}</p>
          {error && <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" /> {t('panel.changeSubmit')}
          </button>
        </form>
      </motion.div>
    </div>,
    document.body,
  )
}
