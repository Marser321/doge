
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { MagneticButton } from "@/components/shared/MagneticButton"
import { ArrowRight, Sparkles, Map, Store, Zap, CheckCircle } from 'lucide-react'
import { TiltCard } from '@/components/TiltCard'

export const EcosystemSection = ({ t }: { t: any }) => {
  return (
    <>
            {/* 2.6 ECOSYSTEM CONNECTED (Services ↔ Map ↔ Store) */}
            <section className="py-12 md:py-16 bg-background relative z-20 overflow-hidden transition-colors duration-500 section-blur-divider">
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
              <div className="max-w-7xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                  <div>
                    <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">{t('eco.badge')}</span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase font-michroma leading-tight">
                      {t('eco.title')} <br /> <span className="silver-text">{t('eco.title2')}</span>
                    </h2>
                  </div>
                  <p className="text-accent max-w-sm font-medium border-l border-accent/10 pl-6 h-fit">
                    {t('eco.subtitle')}
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                  {[
                    { icon: Sparkles, titleKey: 'eco.services.title' as const, descKey: 'eco.services.desc' as const, href: '/services', color: 'from-blue-500/10 to-cyan-500/10' },
                    { icon: Map, titleKey: 'eco.map.title' as const, descKey: 'eco.map.desc' as const, href: '#cobertura', color: 'from-emerald-500/10 to-teal-500/10' },
                    { icon: Store, titleKey: 'eco.store.title' as const, descKey: 'eco.store.desc' as const, href: '/store', color: 'from-amber-500/10 to-orange-500/10' },
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <TiltCard maxTilt={4} scale={1.02} className="h-full">
                        <Link href={item.href} className="block h-full">
                          <div className="group luxury-glass p-8 md:p-10 rounded-[32px] overflow-hidden cursor-hover-target shadow-xl h-full flex flex-col justify-between min-h-[240px] hover:border-accent/30 transition-all relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                            <div className="relative z-10">
                              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                <item.icon className="w-7 h-7 text-foreground" />
                              </div>
                              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight font-michroma mb-3">{t(item.titleKey)}</h3>
                              <p className="text-accent font-medium leading-relaxed text-sm">{t(item.descKey)}</p>
                            </div>
                            <div className="relative z-10 pt-6 flex items-center gap-2 text-accent group-hover:text-foreground transition-colors">
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>

                {/* Advantage Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="luxury-glass p-8 md:p-10 rounded-[32px] flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12"
                >
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                      <CheckCircle className="w-7 h-7 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-black uppercase font-michroma mb-3 text-foreground">{t('eco.advantage')}</h3>
                    <div className="space-y-2">
                      <p className="text-accent font-medium text-sm leading-relaxed">• {t('eco.adv1')}</p>
                      <p className="text-accent font-medium text-sm leading-relaxed">• {t('eco.adv2')}</p>
                    </div>
                  </div>
                  <MagneticButton href="/membership" className="cursor-hover-target whitespace-nowrap">
                    <span className="inline-flex items-center px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-black bg-white rounded-xl shadow-xl hover:bg-zinc-200 transition-all">
                      {t('mem.cta')}
                    </span>
                  </MagneticButton>
                </motion.div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            </section>

    </>
  );
};
