'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Globe, ShoppingCart, MoreVertical, User, CreditCard, History, Settings, LogOut, X, ArrowRight, Shield } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'

interface HeaderActionsProps {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}

export default function HeaderActions({ theme, onToggleTheme }: HeaderActionsProps) {
  const { lang, toggleLang, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Close menu on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const MENU_ITEMS = [
    { icon: User, label: t('nav.myAccount'), href: '/account', disabled: false },
    { icon: CreditCard, label: t('nav.paymentMethods'), href: '/account', disabled: false },
    { icon: History, label: t('nav.serviceHistory'), href: '/account', disabled: false },
    { icon: Shield, label: 'Admin (CEO)', href: '/admin', disabled: false },
    { icon: Settings, label: t('nav.settings'), href: '/account', disabled: false },
  ]

  return (
    <div className="flex items-center gap-2">
      {/* Language Toggle */}
      <button
        onClick={toggleLang}
        className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-all cursor-hover-target flex items-center gap-1.5 group"
        aria-label="Toggle Language"
        id="lang-toggle"
      >
        <Globe className="w-4 h-4 text-accent group-hover:text-foreground transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-accent group-hover:text-foreground transition-colors">
          {lang === 'es' ? 'EN' : 'ES'}
        </span>
      </button>

      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-all cursor-hover-target"
        aria-label="Toggle Theme"
        id="theme-toggle"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-white" />
        ) : (
          <Moon className="w-4 h-4 text-black" />
        )}
      </button>

      {/* Cart Icon */}
      <Link
        href="/store"
        className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-all cursor-hover-target relative"
        aria-label="Shopping Cart"
        id="cart-icon"
      >
        <ShoppingCart className="w-4 h-4 text-accent hover:text-foreground transition-colors" />
      </Link>

      {/* Account Menu (3-dot) */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-all cursor-hover-target"
          aria-label="Account Menu"
          aria-expanded={menuOpen}
          id="account-menu-trigger"
        >
          {menuOpen ? (
            <X className="w-4 h-4 text-foreground" />
          ) : (
            <MoreVertical className="w-4 h-4 text-accent hover:text-foreground transition-colors" />
          )}
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, scale: 0.96, filter: 'blur(8px)' }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="absolute top-full right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl overflow-hidden z-[999]"
              id="account-menu-dropdown"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">{lang === 'es' ? 'Invitado' : 'Guest'}</span>
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {lang === 'es' ? 'Sin suscripción' : 'No subscription'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                {MENU_ITEMS.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                    <span className="ml-auto">
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                    </span>
                  </Link>
                ))}
              </div>

              {/* Membership CTA */}
              <div className="p-3 border-t border-white/5">
                <Link
                  href="/membership"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-200 transition-all"
                >
                  {t('mem.cta')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
