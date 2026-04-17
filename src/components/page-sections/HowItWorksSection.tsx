
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MagneticButton } from '@/components/shared/MagneticButton'
import { ArrowRight, Camera, DollarSign, CalendarCheck, CheckCircle, Sparkles } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'

export const HowItWorksSection = ({ t }: { t: any }) => {
  return (
    <>
            {/* 2.5 HOW IT WORKS (4-Step Visual Flow) */}
            <section className="py-12 md:py-16 bg-background relative z-20 overflow-hidden transition-colors duration-500">
              <div className="max-w-7xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center max-w-4xl mx-auto mb-12 md:mb-16"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/10 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                    <Sparkles className="w-3 h-3" /> {t('how.badge')}
                  </span>
                  <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl font-black text-foreground mt-6 mb-8 tracking-tighter uppercase leading-[1.1]">
                    {t('how.title')} <br /> <span className="silver-text">{t('how.title2')}</span>
                  </h2>
                  <p className="text-accent text-lg md:text-xl font-medium max-w-2xl mx-auto">
                    {t('how.subtitle')}
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                  {[
                    { step: '01', icon: Camera, titleKey: 'how.step1.title' as const, descKey: 'how.step1.desc' as const },
                    { step: '02', icon: DollarSign, titleKey: 'how.step2.title' as const, descKey: 'how.step2.desc' as const },
                    { step: '03', icon: CalendarCheck, titleKey: 'how.step3.title' as const, descKey: 'how.step3.desc' as const },
                    { step: '04', icon: CheckCircle, titleKey: 'how.step4.title' as const, descKey: 'how.step4.desc' as const },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <TiltCard maxTilt={4} scale={1.02} className="h-full">
                        <div className="group relative bg-foreground/5 p-8 md:p-10 rounded-[32px] border border-accent/10 hover:border-accent/30 transition-all overflow-hidden cursor-hover-target h-full flex flex-col">
                          <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-700"></div>

                          <div className="flex items-center gap-4 mb-6">
                            <span className="text-5xl font-black text-accent/20 font-michroma leading-none">{item.step}</span>
                            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center border border-accent/10 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500">
                              <item.icon className="w-6 h-6 text-foreground" />
                            </div>
                          </div>

                          <h3 className="text-lg md:text-xl font-black text-foreground mb-3 tracking-tight uppercase font-michroma">
                            {t(item.titleKey)}
                          </h3>
                          <p className="text-accent font-medium leading-relaxed text-sm flex-grow">
                            {t(item.descKey)}
                          </p>

                          {idx < 3 && (
                            <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30">
                              <ArrowRight className="w-5 h-5 text-accent/30" />
                            </div>
                          )}
                        </div>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>

                {/* CTA under How It Works */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mt-16"
                >
                  <MagneticButton href="/services" className="cursor-hover-target">
                    <span className="inline-flex items-center px-10 py-5 text-sm font-black uppercase tracking-[0.2em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all cta-glow btn-whimsy relative group">
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                      <span className="relative z-10 flex items-center gap-3">
                        {t('services.requestEstimate')} <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </span>
                    </span>
                  </MagneticButton>
                </motion.div>
              </div>
            </section>

    </>
  );
};
