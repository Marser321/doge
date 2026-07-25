'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, ArrowRight, Sparkles, Store, Shield, Layers, CalendarPlus } from 'lucide-react'
import HeaderActions from '@/components/HeaderActions'

export const NavigationSection = ({
  t,
  theme,
  toggleTheme
}: {
  t: any
  theme: 'dark' | 'light'
  toggleTheme: () => void
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <>
      {/* 1. NAVIGATION (Noir Glassmorphism with Safe Area Padding & Adaptive Drawer) */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="fixed w-full z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 pt-[env(safe-area-inset-top,0px)]"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer cursor-hover-target">
            <motion.div
              whileHover={{ scale: 0.95 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-10 h-10 flex items-center justify-center transition-all"
            >
              <Image
                src="/doge-logo-transparent.png"
                alt="DOGE Premium Logo"
                fill
                className="object-contain"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-foreground transition-colors uppercase font-michroma leading-none">
                DOGE.S.M LLC
              </span>
              <span className="text-[9px] font-bold tracking-[0.3em] text-accent uppercase mt-1">
                Cleaning Service
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex gap-10 items-center text-[10px] font-black text-zinc-400 tracking-[0.2em] z-50 uppercase">
            <Link
              href="/services"
              className="hover:text-foreground transition-colors relative group cursor-hover-target"
            >
              {t('nav.services')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </Link>
            <a
              href="#suscripciones"
              className="hover:text-foreground transition-colors relative group cursor-hover-target"
            >
              {t('nav.memberships')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </a>
            <a
              href="#confianza"
              className="hover:text-foreground transition-colors relative group cursor-hover-target"
            >
              {t('nav.trust')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </a>
            <Link
              href="/store"
              className="hover:text-foreground transition-colors relative group cursor-hover-target text-foreground"
            >
              {t('nav.store')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all group-hover:w-full"></span>
            </Link>

            {/* Header Actions: Language, Theme, Cart, Account Menu */}
            <HeaderActions theme={theme} onToggleTheme={toggleTheme} />
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <HeaderActions theme={theme} onToggleTheme={toggleTheme} />
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center text-foreground cursor-pointer"
              aria-label="Toggle Navigation Drawer"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-3xl overflow-hidden px-6 py-6"
            >
              <div className="flex flex-col gap-4">
                <Link
                  href="/services"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 text-sm font-bold text-foreground hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>{t('nav.services')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </Link>

                <a
                  href="#suscripciones"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 text-sm font-bold text-foreground hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-accent" />
                    <span>{t('nav.memberships')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </a>

                <a
                  href="#confianza"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 text-sm font-bold text-foreground hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-accent" />
                    <span>{t('nav.trust')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </a>

                <Link
                  href="/store"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 text-sm font-bold text-foreground hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-accent" />
                    <span>{t('nav.store')}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </Link>

                <Link
                  href="/booking"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center justify-center gap-2 p-4 rounded-xl bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all mt-2"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span>Agendar Cuadrilla</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
