'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, CheckCircle, Crown, Send } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export default function MembershipPage() {
  const { lang, t } = useLanguage()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('plata')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light'
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme
    }
  }, [])

  const plans = [
    {
      id: 'bronce',
      name: 'Bronce',
      price: 150,
      freqEs: 'Mensual',
      freqEn: 'Monthly',
      popular: false,
    },
    {
      id: 'plata',
      name: 'Plata',
      price: 250,
      freqEs: 'Quincenal',
      freqEn: 'Biweekly',
      popular: true,
    },
    {
      id: 'oro',
      name: 'Oro VIP',
      price: 450,
      freqEs: 'Semanal',
      freqEn: 'Weekly',
      popular: false,
    },
  ]

  const chosen = plans.find(p => p.id === selectedPlan) || plans[1]

  const isValid = name.trim() && contact.trim() && address.trim()

  const handleSubmit = () => {
    const message = encodeURIComponent(
      `Hola DOGE.S.M LLC, quiero suscribirme a la membresía.\n\n` +
      `📋 Plan: ${chosen.name} (${lang === 'es' ? chosen.freqEs : chosen.freqEn} — $${chosen.price}/visita)\n` +
      `👤 Nombre: ${name}\n` +
      `📞 Contacto: ${contact}\n` +
      `📍 Dirección: ${address}`
    )
    window.open(`https://wa.me/17869283948?text=${message}`, '_blank', 'noopener,noreferrer')
    setSubmitted(true)
  }

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
            <Crown className="w-12 h-12 text-accent" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tighter mb-6 font-michroma">
            {lang === 'es' ? 'Solicitud' : 'Application'} <br />
            <span className="silver-text">{lang === 'es' ? 'Enviada.' : 'Sent.'}</span>
          </h2>
          <p className="text-accent text-lg font-medium leading-relaxed mb-12">
            {lang === 'es'
              ? `Tu solicitud de membresía ${chosen.name} ha sido enviada. Nuestro equipo te contactará para confirmar tu suscripción.`
              : `Your ${chosen.name} membership application has been sent. Our team will contact you to confirm your subscription.`}
          </p>
          <Link href="/" className="inline-flex py-5 px-12 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl font-michroma">
            {lang === 'es' ? 'Volver al Inicio' : 'Back to Home'}
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground selection:bg-accent/30 overflow-hidden relative">
      <div className="bg-noise"></div>

      {/* Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[min(800px,80vw)] h-[min(800px,80vw)] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[min(600px,60vw)] h-[min(600px,60vw)] bg-foreground/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-[0.3em]">{lang === 'es' ? 'Inicio' : 'Home'}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-accent" />
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">DOGE<span className="text-accent underline underline-offset-4 decoration-2">{lang === 'es' ? 'Membresía' : 'Membership'}</span></span>
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
            <ShieldCheck className="w-4 h-4" /> {lang === 'es' ? 'Registro Simple' : 'Simple Registration'}
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
            {t('membership.title')} <br className="hidden md:block" /> <span className="silver-text">{t('membership.title2')}</span>
          </h1>
          <p className="text-accent text-lg font-medium max-w-2xl leading-relaxed">
            {t('membership.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Plan Selection (3 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="lg:col-span-3 space-y-6"
          >
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent block">
              {t('membership.selectPlan')}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <motion.button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  whileHover={{ y: -3 }}
                  className={`p-6 rounded-[24px] border transition-all text-left relative overflow-hidden ${
                    selectedPlan === plan.id
                      ? 'bg-foreground text-background border-foreground shadow-2xl'
                      : 'bg-foreground/5 border-accent/10 hover:border-accent/40'
                  }`}
                >
                  {plan.popular && (
                    <div className={`absolute top-3 right-3 text-[7px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${
                      selectedPlan === plan.id
                        ? 'bg-background/20 text-background'
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {lang === 'es' ? 'Popular' : 'Popular'}
                    </div>
                  )}
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] block mb-2 ${
                    selectedPlan === plan.id ? 'opacity-60' : 'text-accent'
                  }`}>
                    {lang === 'es' ? plan.freqEs : plan.freqEn}
                  </span>
                  <h3 className="text-xl font-black uppercase font-michroma mb-3">{plan.name}</h3>
                  <div>
                    <span className="text-3xl font-black font-michroma">${plan.price}</span>
                    <span className={`text-[10px] font-bold ml-1 uppercase tracking-widest ${
                      selectedPlan === plan.id ? 'opacity-60' : 'text-accent'
                    }`}>
                      {lang === 'es' ? '/visita' : '/visit'}
                    </span>
                  </div>
                  {selectedPlan === plan.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-3 right-3"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right: Contact Form (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('membership.nameLabel')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'es' ? 'Tu nombre completo' : 'Your full name'}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('membership.contactLabel')}
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={lang === 'es' ? 'Teléfono o email' : 'Phone or email'}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">
                {t('membership.addressLabel')}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={lang === 'es' ? 'Dirección de la propiedad' : 'Property address'}
                className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30"
              />
            </div>

            {/* Submit */}
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
                {t('membership.submit')}
              </span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
