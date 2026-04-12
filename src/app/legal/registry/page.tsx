'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield, MapPin } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export default function RegistryPage() {
  const { lang, t } = useLanguage()

  useEffect(() => {
    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light'
    if (savedTheme) document.documentElement.dataset.theme = savedTheme
  }, [])

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground selection:bg-accent/30 overflow-hidden relative">
      <div className="bg-noise"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[min(600px,60vw)] h-[min(600px,60vw)] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-[0.3em]">{t('legal.back')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-accent" />
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">DOGE<span className="text-accent underline underline-offset-4 decoration-2">{lang === 'es' ? 'Legal' : 'Legal'}</span></span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 md:py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
            <span className="silver-text">{t('legal.registry.title')}</span>
          </h1>
          <p className="text-accent text-sm font-bold uppercase tracking-widest mb-12">
            {t('legal.lastUpdated')}: {lang === 'es' ? 'Abril 2026' : 'April 2026'}
          </p>

          <div className="space-y-8">
            <div className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-6">
              <h2 className="text-xl font-black text-foreground uppercase font-michroma">
                {lang === 'es' ? 'Registro Corporativo' : 'Corporate Registration'}
              </h2>
              <div className="space-y-4">
                {[
                  { label: lang === 'es' ? 'Razón Social' : 'Legal Name', value: 'DOGE.S.M LLC' },
                  { label: lang === 'es' ? 'Tipo de Entidad' : 'Entity Type', value: 'Limited Liability Company (LLC)' },
                  { label: lang === 'es' ? 'Estado de Registro' : 'State of Registration', value: 'Florida, United States' },
                  { label: lang === 'es' ? 'Representante Legal' : 'Registered Agent', value: 'David Sotolongo Martinez' },
                  { label: lang === 'es' ? 'Área de Operaciones' : 'Area of Operations', value: 'Miami & South Florida, USA' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-accent/10 last:border-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">{item.label}</span>
                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <MapPin className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-black text-foreground uppercase font-michroma">
                  {lang === 'es' ? 'Jurisdicción' : 'Jurisdiction'}
                </h2>
              </div>
              <p className="text-accent font-medium leading-relaxed">
                {lang === 'es'
                  ? 'DOGE.S.M LLC está constituida y opera bajo las leyes del Estado de Florida, División de Corporaciones del Departamento de Estado. Nuestra actividad principal se desarrolla en el condado de Miami-Dade y áreas circundantes del sur de Florida.'
                  : 'DOGE.S.M LLC is incorporated and operates under the laws of the State of Florida, Division of Corporations of the Department of State. Our primary operations are conducted in Miami-Dade County and surrounding areas of South Florida.'}
              </p>
            </div>

            <div className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-6">
              <h2 className="text-xl font-black text-foreground uppercase font-michroma">
                {lang === 'es' ? 'Contacto Legal' : 'Legal Contact'}
              </h2>
              <p className="text-accent font-medium leading-relaxed">
                {lang === 'es'
                  ? 'Para consultas legales o de cumplimiento, por favor comuníquese con nuestro equipo:'
                  : 'For legal or compliance inquiries, please contact our team:'}
              </p>
              <div className="space-y-2">
                <a href="mailto:doge.clean.miami@gmail.com" className="text-foreground font-bold hover:text-accent transition-colors block">doge.clean.miami@gmail.com</a>
                <a href="tel:7869283948" className="text-foreground font-bold hover:text-accent transition-colors block font-michroma">786-928-3948</a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-accent/10 py-10 px-6 text-center text-accent/50 text-xs font-bold uppercase tracking-widest bg-background">
        <p>© {new Date().getFullYear()} DOGE.S.M LLC.</p>
      </footer>
    </div>
  )
}
