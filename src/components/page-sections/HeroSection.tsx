
'use client'

import React from 'react'
import { motion, MotionValue } from 'framer-motion'
import Image from 'next/image'
import { MagneticButton } from '@/components/shared/MagneticButton'
import { TextScrubber } from '@/components/shared/TextScrubber'
import { staggerContainer, fadeInUp } from '@/components/shared/animations'
import { ArrowRight, Star, ShieldCheck, CheckCircle } from 'lucide-react'

export const HeroSection = ({
  t,
  heroRef,
  yHeroText,
  yHeroImage,
  scaleHeroImage,
  opacityHero
}: {
  t: any,
  heroRef: React.RefObject<HTMLElement | null>,
  yHeroText: MotionValue<number>,
  yHeroImage: MotionValue<number>,
  scaleHeroImage: MotionValue<number>,
  opacityHero: MotionValue<number>
}) => {
  return (
    <>
            {/* 2. HERO SECTION */}
            <section ref={heroRef} className="relative pt-28 pb-14 md:pt-40 md:pb-24 overflow-hidden min-h-[85vh] md:min-h-[780px] flex items-center bg-background transition-colors duration-500">
              {/* Deep Titanium Aurora Effect */}
              <motion.div
                animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-0 left-1/4 w-[300px] md:w-[600px] h-[400px] md:h-[600px] bg-accent/10 rounded-full blur-[80px] -z-10"
              ></motion.div>

              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center w-full">
                {/* Parallax Hero Text */}
                <motion.div
                  style={{ y: yHeroText, opacity: opacityHero }}
                  initial="initial"
                  animate="animate"
                  variants={staggerContainer}
                  className="max-w-2xl relative z-10"
                >
                  <motion.div variants={fadeInUp} className="mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 text-zinc-200 text-[11px] font-bold uppercase tracking-[0.25em] shadow-sm backdrop-blur-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t('hero.badge')}
                    </span>
                  </motion.div>

                  <TextScrubber
                    text={t('hero.title')}
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground leading-[1.12] tracking-tight uppercase mb-8"
                  />

                  <motion.p variants={fadeInUp} className="text-lg md:text-xl text-zinc-300 dark:text-zinc-300 mb-10 md:mb-12 leading-relaxed font-medium max-w-lg">
                    {t('hero.desc')} <span className="text-white font-bold">{t('hero.desc_bold')}</span>
                  </motion.p>

                  <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-8 items-center">
                    <MagneticButton href="/booking" className="inline-flex items-center justify-center px-10 py-6 text-sm font-black uppercase tracking-[0.2em] text-black bg-white rounded-xl shadow-2xl hover:bg-zinc-200 transition-all group cursor-hover-target w-full sm:w-auto cta-glow btn-whimsy hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.15)] relative">
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
                      <span className="relative z-10 flex items-center">{t('hero.cta')} <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" /></span>
                    </MagneticButton>
                    <div className="flex gap-4 items-center justify-center sm:justify-start">
                      <div className="flex -space-x-2.5">
                        {[
                          { initials: 'MR', bg: 'from-amber-600 to-amber-900', label: 'Star Island' },
                          { initials: 'SC', bg: 'from-sky-600 to-sky-900', label: 'Brickell Penthouse' },
                          { initials: 'DL', bg: 'from-emerald-600 to-emerald-900', label: 'Fisher Island' },
                        ].map((client, i) => (
                          <div
                            key={i}
                            title={client.label}
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${client.bg} border-2 border-slate-950 flex justify-center items-center text-xs font-black text-white shadow-xl transition-transform hover:scale-110`}
                          >
                            {client.initials}
                          </div>
                        ))}
                      </div>
                      <div className="border-l border-white/15 pl-4">
                        <div className="flex mb-0.5 scale-75 origin-left gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400"/>)}
                        </div>
                        <span className="text-[10px] font-black text-zinc-200 uppercase tracking-widest">{t('hero.social')}</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Parallax Hero Image Container */}
                <motion.div
                  style={{ y: yHeroImage, scale: scaleHeroImage, opacity: opacityHero }}
                  initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-[450px] md:h-[600px] lg:h-[750px] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-8 lg:mt-0"
                >
                  <div className="absolute inset-0 bg-zinc-900">
                    <Image
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop"
                      alt="Luxury Property Miami"
                      fill
                      priority
                      className="object-cover opacity-60 transition-transform duration-[20s] hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                    {/* Floating Element 1 - Real-time Status (Noir Style) */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-8 right-8 glass-panel p-5 rounded-2xl shadow-titanium"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex justify-center items-center text-foreground backdrop-blur-md border border-white/10">
                          <CheckCircle className="w-6 h-6"/>
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-wider">{t('hero.auditComplete')}</p>
                          <p className="text-[10px] font-bold text-taupe uppercase tracking-tighter">{t('hero.statusProtected')}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Floating Element 2 - Safety Badge (Noir Style) */}
                    <motion.div
                      animate={{ x: [0, 8, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-8 left-8 glass-panel p-6 rounded-2xl shadow-titanium text-white"
                    >
                      <div className="flex gap-4 items-center mb-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-white/10">
                          <ShieldCheck className="w-5 h-5 text-white"/>
                        </div>
                        <div>
                          <span className="block font-bold text-sm tracking-tight uppercase">{t('hero.vipGuarantee')}</span>
                          <span className="text-[9px] font-black text-taupe uppercase tracking-[0.2em] leading-none">{t('hero.securityActive')}</span>
                        </div>
                      </div>
                      <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, delay: 1, ease: "easeOut" }}
                          className="bg-white h-full"
                        ></motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </section>


    </>
  );
};
