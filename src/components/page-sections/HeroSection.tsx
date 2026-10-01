'use client'

import React from 'react'
import { motion, MotionValue } from 'framer-motion'
import Link from 'next/link'
import { fadeInUp, staggerContainer } from '@/components/shared/animations'
import { ShieldCheck, UserPlus, LogIn, ArrowRight, Sparkles, Award } from 'lucide-react'
import type { TranslationKey } from '@/data/i18n'

export const HeroSection = ({
  t,
  heroRef,
  yHeroText,
  opacityHero
}: {
  t: (key: TranslationKey) => string,
  heroRef: React.RefObject<HTMLElement | null>,
  yHeroText?: MotionValue<number>,
  yHeroImage?: MotionValue<number>,
  scaleHeroImage?: MotionValue<number>,
  opacityHero?: MotionValue<number>
}) => {
  return (
    <section
      ref={heroRef}
      className="relative pt-28 pb-16 md:pt-40 md:pb-24 overflow-hidden min-h-[70vh] flex items-center justify-center bg-background transition-colors duration-500"
    >
      {/* Deep Titanium Aurora Ambient Glows (No images) */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(700px,90vw)] h-[min(450px,60vh)] bg-accent/10 rounded-full blur-[100px] -z-10 pointer-events-none"
      />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-[90px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 w-full text-center relative z-10">
        <motion.div
          style={{ y: yHeroText, opacity: opacityHero }}
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="flex flex-col items-center"
        >
          {/* Top Luxury Pill Badge */}
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-white/15 bg-white/10 text-zinc-200 text-[11px] font-bold uppercase tracking-[0.25em] shadow-sm backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t('hero.badge')} • MIAMI
            </span>
          </motion.div>

          {/* Main Title (No images, pure typography & gradient) */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[1.08] tracking-tight uppercase mb-6 font-michroma max-w-4xl"
          >
            {t('hero.title')}{' '}
            <span className="silver-text block md:inline font-michroma">MIAMI</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg md:text-xl text-zinc-300 dark:text-zinc-300 mb-10 md:mb-12 leading-relaxed font-medium max-w-2xl mx-auto"
          >
            {t('hero.desc')}{' '}
            <span className="text-white font-bold">{t('hero.desc_bold')}</span>
          </motion.p>

          {/* Action Buttons: Crear Cuenta & Iniciar Sesión */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center w-full max-w-md sm:max-w-none mb-10"
          >
            {/* Primary Action: Crear cuenta / Crear sesión */}
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-5 text-xs font-black uppercase tracking-[0.22em] text-black bg-white rounded-2xl shadow-2xl hover:bg-zinc-200 transition-all group cursor-pointer w-full sm:w-auto cta-glow hover:shadow-[0_0_40px_8px_rgba(255,255,255,0.18)] relative overflow-hidden"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />
              <span className="relative z-10 flex items-center gap-2.5">
                <UserPlus className="w-4 h-4" />
                {t('hero.createSession')}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </span>
            </Link>

            {/* Secondary Action: Iniciar sesión */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-5 text-xs font-black uppercase tracking-[0.22em] text-white rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 transition-all group cursor-pointer w-full sm:w-auto shadow-xl"
            >
              <span className="flex items-center gap-2.5">
                <LogIn className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
                {t('hero.signIn')}
              </span>
            </Link>
          </motion.div>

          {/* Quick link to explore services as guest */}
          <motion.div variants={fadeInUp} className="mb-14">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors py-2 px-4 rounded-xl hover:bg-white/5"
            >
              <span>{t('hero.guestExplore')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </motion.div>

          {/* 3 Value Highlight Badges (Obsidian Glass Cards, completely image-free) */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full text-left"
          >
            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-white/20 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1.5 font-michroma">
                {t('hero.feature1Title')}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {t('hero.feature1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-white/20 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1.5 font-michroma">
                {t('hero.feature2Title')}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {t('hero.feature2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl hover:border-white/20 transition-all shadow-lg">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                <Award className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1.5 font-michroma">
                {t('hero.feature3Title')}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {t('hero.feature3Desc')}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
