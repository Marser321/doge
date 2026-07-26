
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Droplets, Sofa, Waves } from 'lucide-react'
import { serviceImagery } from '@/content/service-imagery'
import type { TranslationKey } from '@/data/i18n'

export const ServicesSection = ({ t }: { t: (key: TranslationKey) => string }) => {
  return (
    <>
            {/* 3.1 SERVICIOS (Bento Grid Architecture - 2026 Luxury) */}
            <section id="servicios" className="py-12 md:py-16 bg-background relative z-20 overflow-hidden transition-colors duration-500">
              <div className="max-w-7xl mx-auto px-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-8"
                >
                  <div>
                    <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-4 block">{t('svc.badge')}</span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter uppercase font-michroma leading-tight">{t('svc.title')} <br/> <span className="silver-text">{t('svc.title2')}</span></h2>
                  </div>
                  <p className="text-accent max-w-sm font-medium border-l border-accent/10 pl-6 h-fit">
                    {t('svc.subtitle')}
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full">
                  {/* Main Service - Window Cleaning */}
                  <motion.div whileHover={{ y: -5 }} className="md:col-span-2 md:row-span-2">
                    <Link
                      href="/services/window-cleaning"
                      className="luxury-glass p-10 md:p-12 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-2xl flex flex-col justify-between min-h-[400px] h-full"
                    >
                      <Image src={serviceImagery.windowCleaning.src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-35 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-50" />
                      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/92 via-zinc-950/68 to-zinc-950/20"></div>
                      <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                          <Droplets className="w-8 h-8 text-foreground" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-michroma mb-6">{t('svc.window.title')}</h3>
                        <p className="text-accent font-medium text-lg leading-relaxed max-w-sm">
                          {t('svc.window.desc')}
                        </p>
                      </div>
                      <div className="relative z-10 pt-12 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent">{t('svc.window.badge')}</span>
                        <ArrowRight className="w-6 h-6 text-accent group-hover:translate-x-2 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>

                  {/* Sub Service 1 - Pressure Washing */}
                  <motion.div whileHover={{ y: -5 }} className="md:col-span-2">
                    <Link
                      href="/services/pressure-washing"
                      className="luxury-glass p-8 md:p-10 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-xl flex items-center justify-between h-full"
                    >
                      <div className="relative z-10 flex flex-col gap-2">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 border border-white/10">
                          <Waves className="w-6 h-6 text-foreground" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight font-michroma">{t('svc.pressure.title')}</h3>
                        <p className="text-accent text-sm font-medium max-w-xs">{t('svc.pressure.desc')}</p>
                      </div>
                      <Image src={serviceImagery.pressureWashing.src} alt="" width={150} height={150} sizes="150px" className="rounded-2xl object-cover grayscale opacity-30 group-hover:opacity-55 transition-opacity" />
                    </Link>
                  </motion.div>

                  {/* Sub Service 2 - Carpet Cleaning */}
                  <motion.div whileHover={{ y: -5 }} className="md:col-span-2">
                    <Link
                      href="/services/carpet-cleaning"
                      className="luxury-glass p-8 rounded-[32px] overflow-hidden relative group cursor-hover-target shadow-xl flex flex-col justify-between h-full min-h-[180px]"
                    >
                      <Image src={serviceImagery.carpetCleaning.src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-25 transition duration-700 group-hover:opacity-40" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/90 via-zinc-950/55 to-zinc-950/10"></div>
                      <div className="relative z-10">
                        <Sofa className="w-8 h-8 text-foreground mb-4" />
                        <h3 className="text-lg font-black uppercase font-michroma tracking-tighter">{t('svc.carpet.title')}</h3>
                      </div>
                      <p className="relative z-10 text-accent text-xs font-bold uppercase tracking-widest">{t('svc.carpet.desc')}</p>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </section>

    </>
  );
};
