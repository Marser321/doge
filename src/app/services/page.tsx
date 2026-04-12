'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Droplets, Home, ShieldCheck, Zap, ArrowRight, Sparkles, Lock } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

const SERVICES = [
  {
    id: 'window-cleaning',
    icon: Droplets,
    nameEs: 'Limpieza de Cristales',
    nameEn: 'Window Cleaning',
    descEs: 'Tecnología WFP de agua pura. Cristales impecables sin marcas ni químicos. Sube fotos de tus ventanas y recibe un estimado en horas.',
    descEn: 'WFP pure water technology. Spotless glass with no marks or chemicals. Upload photos of your windows and get an estimate within hours.',
    active: true,
    accent: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 'residential-vip',
    icon: Home,
    nameEs: 'Residencial VIP Elite',
    nameEn: 'VIP Elite Residential',
    descEs: 'Desinfección HEPA de grado médico. Tratamiento profundo para mobiliario de lujo, mármol y roble.',
    descEn: 'Medical-grade HEPA disinfection. Deep treatment for luxury furniture, marble and oak.',
    active: true,
    accent: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'post-construction',
    icon: ShieldCheck,
    nameEs: 'Post-Construcción',
    nameEn: 'Post-Construction',
    descEs: 'Retiro intensivo de polvo de obra, materiales pesados y residuos de construcción.',
    descEn: 'Intensive removal of construction dust, heavy materials and building debris.',
    active: true,
    accent: 'from-zinc-500/20 to-slate-500/20',
  },
  {
    id: 'florida-control',
    icon: Zap,
    nameEs: 'Control Florida Anti-Humedad',
    nameEn: 'Florida Anti-Moisture Control',
    descEs: 'Control de humedad 24/7 para propiedades costeras. Prevención de moho y corrosión.',
    descEn: '24/7 moisture control for coastal properties. Mold and corrosion prevention.',
    active: true,
    accent: 'from-emerald-500/20 to-teal-500/20',
  },
]

export default function ServicesPage() {
  const { lang, t } = useLanguage()

  useEffect(() => {
    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light'
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme
    }
  }, [])

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground selection:bg-accent/30 overflow-hidden relative">
      <div className="bg-noise"></div>

      {/* Background Decorative */}
      <div className="absolute top-[-10%] right-[-10%] w-[min(800px,80vw)] h-[min(800px,80vw)] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[min(600px,60vw)] h-[min(600px,60vw)] bg-foreground/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-[0.3em]">{lang === 'es' ? 'Inicio' : 'Home'}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">DOGE<span className="text-accent underline underline-offset-4 decoration-2">{lang === 'es' ? 'Servicios' : 'Services'}</span></span>
        </div>
      </nav>

      {/* Header */}
      <header className="px-6 md:px-12 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/20 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-8">
            <ShieldCheck className="w-4 h-4" /> {lang === 'es' ? 'Sin Suscripción Obligatoria' : 'No Subscription Required'}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
            {t('services.title')} <br className="hidden md:block" /> <span className="silver-text">{t('services.title2')}</span>
          </h1>
          <p className="text-accent text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            {t('services.subtitle')}
          </p>
        </motion.div>
      </header>

      {/* Services Grid */}
      <section className="px-6 md:px-12 pb-32 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {service.active ? (
                <Link href={`/services/${service.id}`} className="block">
                  <div className="luxury-glass p-8 md:p-10 rounded-[32px] overflow-hidden group cursor-hover-target shadow-xl flex flex-col justify-between min-h-[300px] hover:border-accent/40 transition-all relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <service.icon className="w-7 h-7 text-foreground" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-michroma mb-4">
                        {lang === 'es' ? service.nameEs : service.nameEn}
                      </h3>
                      <p className="text-accent font-medium leading-relaxed max-w-md">
                        {lang === 'es' ? service.descEs : service.descEn}
                      </p>
                    </div>

                    <div className="relative z-10 pt-8 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        {lang === 'es' ? 'Disponible' : 'Available'}
                      </span>
                      <div className="flex items-center gap-2 text-accent group-hover:text-foreground transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest">{t('services.requestEstimate')}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="luxury-glass p-8 md:p-10 rounded-[32px] overflow-hidden shadow-xl flex flex-col justify-between min-h-[300px] opacity-50 relative">
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                      <service.icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight font-michroma mb-4 text-accent">
                      {lang === 'es' ? service.nameEs : service.nameEn}
                    </h3>
                    <p className="text-accent/60 font-medium leading-relaxed max-w-md">
                      {lang === 'es' ? service.descEs : service.descEn}
                    </p>
                  </div>
                  <div className="relative z-10 pt-8 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-500 text-[9px] font-black uppercase tracking-widest">
                      <Lock className="w-3 h-3" />
                      {t('services.comingSoon')}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-accent/10 py-10 px-6 text-center text-accent/50 text-xs font-bold uppercase tracking-widest bg-background">
        <p>© {new Date().getFullYear()} DOGE.S.M LLC.</p>
      </footer>
    </div>
  )
}
