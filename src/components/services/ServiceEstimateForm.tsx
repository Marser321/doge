'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle, ShieldCheck, FileText } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'
import type { ServiceDefinition } from '@/content/services'
import type { TranslationKey } from '@/data/i18n'

const WHATSAPP_NUMBER = '17869283948'

/**
 * Single intake form shared by every service page. The per-service copy is
 * resolved from the definition's `keyPrefix`, operating purely in text mode without images.
 */
export function ServiceEstimateForm({ service }: { service: ServiceDefinition }) {
  const { lang, t } = useLanguage()
  const [textDescription, setTextDescription] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const ServiceIcon = service.icon
  const own = (suffix: string) => t(`${service.keyPrefix}.${suffix}` as TranslationKey)

  useEffect(() => {
    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light'
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme
    }
  }, [])

  const handleSubmit = () => {
    const message = encodeURIComponent(
      `${t('estimate.waIntro')} ${service.name[lang]}.\n\n` +
      `📝 ${t('estimate.waDescription')}: ${textDescription.trim()}\n` +
      `👤 ${t('estimate.waName')}: ${name.trim()}\n` +
      `📞 ${t('estimate.waContact')}: ${contact.trim()}\n` +
      `📍 ${t('estimate.waAddress')}: ${address.trim()}\n` +
      (notes.trim() ? `💬 ${t('estimate.waNotes')}: ${notes.trim()}` : '')
    )

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank', 'noopener,noreferrer')
    setSubmitted(true)
  }

  const isValid = Boolean(
    name.trim() &&
    contact.trim() &&
    address.trim() &&
    textDescription.trim()
  )

  if (submitted) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground flex items-center justify-center relative overflow-hidden">
        <div className="bg-noise"></div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          className="text-center max-w-lg px-6"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-24 h-24 bg-accent/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-accent/20 ring-pulse"
          >
            <CheckCircle className="w-12 h-12 text-accent" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter mb-6 font-michroma">
            {t('estimate.sentTitle')} <br />
            <span className="silver-text">{t('estimate.sentTitle2')}</span>
          </h2>
          <p className="text-accent text-lg font-medium leading-relaxed mb-12">
            {t('estimate.sentBody')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/services" className="flex-1 py-5 border border-accent/10 rounded-2xl font-black uppercase tracking-widest text-accent hover:bg-foreground/5 transition-all text-center text-sm">
              {t('estimate.moreServices')}
            </Link>
            <Link href="/" className="flex-1 py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl font-michroma text-center text-sm">
              {t('estimate.home')}
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground selection:bg-accent/30 overflow-hidden relative">
      <div className="bg-noise"></div>

      {/* Background Decorative */}
      <div className="absolute top-[-10%] right-[-10%] w-[min(800px,80vw)] h-[min(800px,80vw)] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[min(600px,60vw)] h-[min(600px,60vw)] bg-foreground/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/services" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-[0.3em]">{lang === 'es' ? 'Servicios' : 'Services'}</span>
        </Link>
        <div className="flex items-center gap-3">
          <ServiceIcon className="w-5 h-5 text-accent" />
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">
            {own('nav')}
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 md:py-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <ShieldCheck className="w-4 h-4" /> {t('estimate.noSubscription')}
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
            {own('title')} <br className="hidden md:block" /> <span className="silver-text">{own('title2')}</span>
          </h1>
          <p className="text-accent text-lg font-medium max-w-2xl leading-relaxed">
            {own('subtitle')}
          </p>
        </motion.div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Description Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="rounded-[28px] border border-accent/15 bg-foreground/5 p-6 md:p-8 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-accent" />
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent block">
                  {t('estimate.textLabel')}
                </label>
              </div>
              <textarea
                value={textDescription}
                onChange={(e) => setTextDescription(e.target.value)}
                placeholder={own('textPlaceholder')}
                rows={10}
                className="w-full bg-background/50 border border-accent/15 rounded-2xl p-5 text-foreground font-medium text-base outline-none focus:border-accent/50 transition-colors resize-none placeholder:text-accent/30 leading-relaxed"
              />
              <p className="mt-3 text-[11px] text-accent/60 font-medium">
                {lang === 'es'
                  ? 'Especifica metraje, condición actual, áreas clave y cualquier requerimiento especial.'
                  : 'Specify square footage, current condition, key areas and any special requirements.'}
              </p>
            </div>
          </motion.div>

          {/* Right: Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('estimate.nameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('estimate.namePlaceholder')}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('estimate.contactLabel')}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('estimate.contactPlaceholder')}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('estimate.addressLabel')}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('estimate.addressPlaceholder')}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('estimate.notesLabel')}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('estimate.notesPlaceholder')}
                rows={3}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors resize-none placeholder:text-accent/30"
              />
            </div>

            {/* Submit CTA */}
            <motion.button
              whileHover={isValid ? { scale: 1.02, y: -2 } : {}}
              onClick={handleSubmit}
              disabled={!isValid}
              className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl font-michroma flex items-center justify-center gap-3 transition-all relative group overflow-hidden ${
                isValid
                  ? 'bg-foreground text-background cursor-pointer cta-glow hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.15)]'
                  : 'bg-accent/20 text-accent/40 cursor-not-allowed'
              }`}
            >
              {isValid && (
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <Send className="w-5 h-5" />
                {t('estimate.submit')}
              </span>
            </motion.button>

            {/* Info Note */}
            <div className="bg-accent/5 p-4 rounded-xl border border-accent/10 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-1 shrink-0"></div>
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest leading-relaxed">
                {t('estimate.note')}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
