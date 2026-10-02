'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Globe, ShoppingCart, MoreVertical, User, X, ArrowRight, BriefcaseBusiness, Sparkles, LogIn, LogOut, UserPlus, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import { useTheme } from './ThemeProvider'
import { getBrowserSupabase } from '@/lib/supabase/client'

export default function HeaderActions() {
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLang, t } = useLanguage()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [account, setAccount] = useState<{ name: string } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // The header used to claim "Invitado" for everyone, signed in or not. Resolve
  // the real session once the menu is first opened, so a visitor who never
  // touches it costs no request.
  useEffect(() => {
    if (!menuOpen || account) return
    let active = true
    void (async () => {
      try {
        const response = await fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' })
        if (active && response.ok) {
          const body = await response.json()
          setAccount({ name: String(body.name || '') })
        }
      } catch {
        // Stay anonymous: the menu simply keeps offering sign in.
      }
    })()
    return () => { active = false }
  }, [menuOpen, account])

  const signOut = async () => {
    await getBrowserSupabase().auth.signOut()
    setAccount(null)
    setMenuOpen(false)
    router.replace('/')
    router.refresh()
  }

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

  const MENU_ITEMS = account
    ? [
      { icon: LayoutDashboard, label: t('panel.tabHome'), href: '/account', disabled: false },
      { icon: BriefcaseBusiness, label: t('nav.services'), href: '/services', disabled: false },
      { icon: Sparkles, label: t('nav.memberships'), href: '/#suscripciones', disabled: false },
    ]
    : [
      { icon: LogIn, label: lang === 'es' ? 'Iniciar sesión' : 'Sign In', href: '/login', disabled: false },
      { icon: UserPlus, label: lang === 'es' ? 'Crear cuenta' : 'Create Account', href: '/signup', disabled: false },
      { icon: BriefcaseBusiness, label: t('nav.services'), href: '/services', disabled: false },
      { icon: Sparkles, label: t('nav.memberships'), href: '/#suscripciones', disabled: false },
    ]

  return (
    <div className="flex items-center gap-2">
      {/* Language Toggle */}
      <button
        onClick={toggleLang}
        className="min-w-[44px] min-h-[44px] p-2 rounded-full border border-subtle hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-strong transition-all cursor-hover-target flex items-center justify-center gap-1.5 group"
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
        onClick={toggleTheme}
        className="min-w-[44px] min-h-[44px] p-2 rounded-full border border-subtle hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-strong transition-all cursor-hover-target flex items-center justify-center"
        aria-label="Toggle Theme"
        id="theme-toggle"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-primary" />
        ) : (
          <Moon className="w-4 h-4 text-primary" />
        )}
      </button>

      {/* Cart Icon */}
      <Link
        href="/store"
        className="min-w-[44px] min-h-[44px] p-2 rounded-full border border-subtle hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-strong transition-all cursor-hover-target flex items-center justify-center relative"
        aria-label="Shopping Cart"
        id="cart-icon"
      >
        <ShoppingCart className="w-4 h-4 text-accent hover:text-foreground transition-colors" />
      </Link>

      {/* Account Menu (3-dot) */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="min-w-[44px] min-h-[44px] p-2 rounded-full border border-subtle hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-strong transition-all cursor-hover-target flex items-center justify-center"
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
              className="absolute top-full right-0 mt-3 w-64 rounded-2xl border border-subtle bg-black/80 backdrop-blur-2xl shadow-2xl overflow-hidden z-[999]"
              id="account-menu-dropdown"
            >
              {/* Header */}
              <div className="p-5 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center border border-subtle">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-primary">
                      {account ? account.name : (lang === 'es' ? 'Invitado' : 'Guest')}
                    </span>
                    <span className="block text-[10px] font-bold text-muted uppercase tracking-widest">
                      {account ? t('panel.tabHome') : (lang === 'es' ? 'Sin sesión' : 'Signed out')}
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:bg-surface-2 hover:text-primary transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                    <span className="ml-auto">
                      <ArrowRight className="w-3.5 h-3.5 text-muted" />
                    </span>
                  </Link>
                ))}
                {account && (
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-secondary hover:bg-surface-2 hover:text-primary transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t('account.logout')}</span>
                  </button>
                )}
              </div>

              {/* Membership CTA */}
              <div className="p-3 border-t border-subtle">
                <Link
                  href="/membership"
                  onClick={() => setMenuOpen(false)}
                  className="block w-full text-center py-3 bg-foreground text-background rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:opacity-90 transition-all"
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
