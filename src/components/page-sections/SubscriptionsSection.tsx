
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Zap } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'
import { MagneticButton } from '@/components/shared/MagneticButton'
import type { TranslationKey } from '@/data/i18n'

export const SubscriptionsSection = ({ isMobile, t }: { isMobile: boolean, t: (key: TranslationKey) => string }) => {
  const plans = [
    { id: 'bronce', nameKey: 'mem.plan.bronce' as TranslationKey, price: 150, freqKey: 'mem.monthly' as TranslationKey, popular: false, featureKeys: ['mem.feat.sanit1', 'mem.feat.agenda', 'mem.feat.support'] as TranslationKey[] },
    { id: 'plata', nameKey: 'mem.plan.plata' as TranslationKey, price: 250, freqKey: 'mem.biweekly' as TranslationKey, popular: true, featureKeys: ['mem.feat.sanit2', 'mem.feat.priority', 'mem.feat.premium'] as TranslationKey[] },
    { id: 'oro', nameKey: 'mem.plan.oro' as TranslationKey, price: 450, freqKey: 'mem.weekly' as TranslationKey, popular: false, featureKeys: ['mem.feat.sanit4', 'mem.feat.vipSlots', 'mem.feat.audit'] as TranslationKey[] },
  ];

  return (
    <>
            {/* 3.2 SUSCRIPCIONES (Noir Memberships) */}
            <section id="suscripciones" className="py-12 md:py-16 bg-background relative z-20 overflow-hidden transition-colors duration-500 section-blur-divider">
              {/* Section blur divider — top fade */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-30 pointer-events-none" />
              {/* Animated Orbs */}
              <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/10 rounded-full blur-[80px] -z-10 opacity-50"></div>

              <div className="max-w-7xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center max-w-4xl mx-auto mb-12 md:mb-16"
                >
                  <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] bg-accent/5 px-4 py-2 rounded-full border border-accent/10">{t('mem.badge')}</span>
                  <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl font-black text-foreground mt-10 mb-8 tracking-tighter uppercase leading-[1.1]">{t('mem.title')} <br/> <span className="silver-text">{t('mem.title2')}</span></h2>
                  <p className="text-accent text-lg md:text-xl font-medium max-w-2xl mx-auto">{t('mem.subtitle2')}</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                  {plans.map((plan, idx) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: isMobile ? 30 : 50, scale: 0.98 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      className="relative"
                    >
                      <TiltCard maxTilt={4} scale={1.03} className="h-full">
                        <div className={`relative rounded-2xl p-10 md:p-12 transition-all flex flex-col cursor-hover-target border h-full ${
                          plan.popular
                          ? `bg-zinc-100 text-black border-white shadow-2xl z-10 md:scale-105`
                          : 'bg-zinc-900/30 border-white/5 text-white hover:border-white/10'
                        }`}>
                          {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-background text-[9px] font-black px-6 py-2 rounded-full tracking-[0.2em] uppercase shadow-xl whitespace-nowrap">
                              {t('mem.mostRequested')}
                            </div>
                          )}
                          <h3 className={`text-2xl md:text-3xl font-black mb-2 uppercase font-michroma ${plan.popular ? 'text-background' : 'text-foreground'}`}>{t(plan.nameKey)}</h3>
                          <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-10 ${plan.popular ? 'text-background/70' : 'text-taupe'}`}>{t(plan.freqKey)}</p>
                          <div className="mb-8 border-b border-accent/10 pb-8">
                            <span className="text-4xl font-black text-foreground font-michroma">${plan.price}</span>
                            <span className={`text-[10px] font-bold ml-2 uppercase tracking-widest ${plan.popular ? 'text-background/70' : 'text-taupe'}`}>{t('mem.perVisit')}</span>
                          </div>
                          <ul className="space-y-4 mb-10 flex-grow">
                            {plan.featureKeys.map((key, i) => (
                              <li key={i} className={`flex items-center text-xs font-bold uppercase tracking-tight ${plan.popular ? 'text-background/80' : 'text-accent'}`}>
                                <CheckCircle className={`w-4 h-4 mr-3 shrink-0 ${plan.popular ? 'text-background' : 'text-accent/60'}`} /> {t(key)}
                              </li>
                            ))}
                          </ul>
                          <MagneticButton
                            href="/membership"
                            className={`w-full text-center py-5 px-8 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all cta-glow ${
                              plan.popular ? 'bg-background text-foreground hover:bg-background/90' : 'bg-accent/5 hover:bg-accent/10 text-foreground border border-accent/10'
                            }`}
                          >
                            {t('mem.cta')}
                          </MagneticButton>
                        </div>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

    </>
  );
};
