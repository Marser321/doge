
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import HeaderActions from '@/components/HeaderActions'

export const NavigationSection = ({ t, theme, toggleTheme }: { t: any, theme: "dark" | "light", toggleTheme: () => void }) => {
  return (
    <>
            {/* 1. NAVIGATION (Noir Glassmorphism) */}
            <motion.nav
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="fixed w-full z-50 bg-black/40 backdrop-blur-2xl border-b border-white/5"
            >
              <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3 group cursor-pointer cursor-hover-target">
                  <motion.div
                    whileHover={{ scale: 0.95 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-10 h-10 flex items-center justify-center transition-all"
                  >
                    <Image
                      src="/doge_logo_premium.png"
                      alt="DOGE Premium Logo"
                      fill
                      className="object-contain mix-blend-plus-lighter dark:mix-blend-screen"
                    />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black tracking-tighter text-foreground transition-colors uppercase font-michroma leading-none">DOGE.S.M LLC</span>
                    <span className="text-[9px] font-bold tracking-[0.3em] text-accent uppercase mt-1">Cleaning Service</span>
                  </div>
                </div>

                <div className="hidden md:flex gap-10 items-center text-[10px] font-black text-zinc-400 tracking-[0.2em] z-50 uppercase">
                  <Link href="/services" className="hover:text-foreground transition-colors relative group cursor-hover-target">
                    {t('nav.services')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
                  </Link>
                  <a href="#suscripciones" className="hover:text-foreground transition-colors relative group cursor-hover-target">
                    {t('nav.memberships')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
                  </a>
                  <a href="#confianza" className="hover:text-foreground transition-colors relative group cursor-hover-target">
                    {t('nav.trust')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
                  </a>
                  <Link href="/store" className="hover:text-foreground transition-colors relative group cursor-hover-target text-foreground">
                    {t('nav.store')}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all group-hover:w-full"></span>
                  </Link>

                  {/* Header Actions: Language, Theme, Cart, Account Menu */}
                  <HeaderActions theme={theme} onToggleTheme={toggleTheme} />
                </div>
              </div>
    </motion.nav>
    </>
  );
};
