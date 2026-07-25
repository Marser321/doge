
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { PrecisionReveal } from '@/components/shared/PrecisionReveal'
import { CheckCircle } from 'lucide-react'
import { PrecisionProtocolScroll } from '@/components/PrecisionProtocolScroll'
import type { TranslationKey } from '@/data/i18n'

export const StorytellingSection = ({ t }: { t: (key: TranslationKey) => string }) => {
  return (
    <>
            {/* 3.12 B2B ELITE & CATÁLOGO COMERCIAL (Precision Storytelling Narrative) */}
            <PrecisionProtocolScroll t={t} />


            {/* 3.15 STORYTELLING PORTFOLIO (Cinematic Immersive - 2026) */}
            <section className="py-12 md:py-16 bg-background relative z-20 text-foreground overflow-hidden transition-colors duration-500">
              <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="max-w-xl"
                  >
                    <span className="text-accent font-black uppercase tracking-[0.3em] text-[10px] mb-8 block">{t('story.badge')}</span>
                    <h2 className="font-michroma text-3xl md:text-5xl lg:text-6xl text-foreground mb-8 tracking-tighter uppercase leading-[1]">{t('story.title')} <br/> <span className="silver-text">{t('story.title2')}</span></h2>
                    <p className="text-accent text-lg md:text-xl font-medium leading-relaxed mb-12">
                      {t('story.desc')} <span className="text-foreground">{t('story.desc_bold')}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                      <div>
                        <span className="text-3xl font-black block mb-2">{t('story.stat1.value')}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{t('story.stat1.label')}</span>
                      </div>
                      <div>
                        <span className="text-3xl font-black block mb-2">{t('story.stat2.value')}</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">{t('story.stat2.label')}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                     initial={{ opacity: 0, x: 30 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     className="lg:col-span-1"
                  >
                     <PrecisionReveal />
                  </motion.div>
                </div>

                {/* Bento Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.div
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     className="relative h-[400px] rounded-[32px] overflow-hidden group border border-white/5 opacity-60"
                  >
                     <Image src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop" alt="Standard Clean" fill className="object-cover grayscale" />
                     <div className="absolute inset-0 bg-black/40"></div>
                     <div className="absolute top-8 left-8">
                       <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">{t('story.conventional')}</span>
                     </div>
                  </motion.div>

                  <motion.div
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: 0.2 }}
                     className="relative h-[400px] rounded-[32px] overflow-hidden group shadow-2xl border border-zinc-500/20"
                  >
                     <Image src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop" alt="Doge standard" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                     <div className="absolute top-8 right-8 bg-white text-black px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                       {t('story.titanium')}
                     </div>
                  </motion.div>
                </div>
              </div>
            </section>

    </>
  );
};
