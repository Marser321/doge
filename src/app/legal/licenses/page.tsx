'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

export default function LicensesPage() {
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
            <span className="silver-text">{t('legal.licenses.title')}</span>
          </h1>
          <p className="text-accent text-sm font-bold uppercase tracking-widest mb-12">
            {t('legal.lastUpdated')}: {lang === 'es' ? 'Abril 2026' : 'April 2026'}
          </p>

          <div className="prose prose-invert max-w-none space-y-8">
            <div className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-6">
              <h2 className="text-xl font-black text-foreground uppercase font-michroma">
                {lang === 'es' ? 'Licencia Comercial' : 'Business License'}
              </h2>
              <p className="text-accent font-medium leading-relaxed">
                {lang === 'es'
                  ? 'DOGE.S.M LLC opera bajo una licencia comercial válida emitida por el Estado de Florida, Estados Unidos. Nuestra empresa está debidamente registrada como una Limited Liability Company (LLC) bajo las leyes del estado de Florida.'
                  : 'DOGE.S.M LLC operates under a valid business license issued by the State of Florida, United States. Our company is duly registered as a Limited Liability Company (LLC) under Florida state law.'}
              </p>
            </div>

            <div className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-6">
              <h2 className="text-xl font-black text-foreground uppercase font-michroma">
                {lang === 'es' ? 'Seguro de Responsabilidad' : 'Liability Insurance'}
              </h2>
              <p className="text-accent font-medium leading-relaxed">
                {lang === 'es'
                  ? 'Contamos con seguro de responsabilidad general (General Liability Insurance) que cubre todas nuestras operaciones de limpieza y mantenimiento. Este seguro protege tanto a nuestros clientes como a nuestro personal durante la prestación de servicios.'
                  : 'We carry General Liability Insurance covering all our cleaning and maintenance operations. This insurance protects both our clients and our staff during service delivery.'}
              </p>
            </div>

            <div className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-6">
              <h2 className="text-xl font-black text-foreground uppercase font-michroma">
                {lang === 'es' ? 'Certificaciones del Personal' : 'Staff Certifications'}
              </h2>
              <p className="text-accent font-medium leading-relaxed">
                {lang === 'es'
                  ? 'Todo nuestro personal de operaciones está capacitado en protocolos de limpieza profesional, manejo seguro de productos químicos y uso de equipos especializados. Realizamos verificaciones de antecedentes y mantenemos estándares de capacitación continua.'
                  : 'All our operations staff are trained in professional cleaning protocols, safe chemical handling, and specialized equipment use. We conduct background checks and maintain continuing education standards.'}
              </p>
            </div>

            <div className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-6">
              <h2 className="text-xl font-black text-foreground uppercase font-michroma">
                {lang === 'es' ? 'Cumplimiento Regulatorio' : 'Regulatory Compliance'}
              </h2>
              <p className="text-accent font-medium leading-relaxed">
                {lang === 'es'
                  ? 'Cumplimos con todas las regulaciones federales, estatales y locales aplicables a nuestros servicios en el área de Miami y el sur de Florida, incluyendo regulaciones ambientales y de seguridad ocupacional (OSHA).'
                  : 'We comply with all applicable federal, state, and local regulations for our services in the Miami and South Florida area, including environmental regulations and occupational safety standards (OSHA).'}
              </p>
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
