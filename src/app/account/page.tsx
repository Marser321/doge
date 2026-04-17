'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, User, CreditCard, History, Settings, Crown, MessageCircle, Sun, Moon, Globe, Bell, ChevronRight, Sparkles, Shield } from 'lucide-react'
import { useLanguage } from '@/components/LanguageProvider'

type TabId = 'profile' | 'payment' | 'history' | 'settings'

export default function AccountPage() {
  const { lang, t, toggleLang } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [notificationsOn, setNotificationsOn] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('doge-theme') as 'dark' | 'light'
    if (savedTheme) {
      requestAnimationFrame(() => setTheme(savedTheme))
      document.documentElement.dataset.theme = savedTheme
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.dataset.theme = newTheme
    localStorage.setItem('doge-theme', newTheme)
  }

  const tabs: { id: TabId; icon: typeof User; labelKey: string }[] = [
    { id: 'profile', icon: User, labelKey: 'account.profile' },
    { id: 'payment', icon: CreditCard, labelKey: 'account.payment' },
    { id: 'history', icon: History, labelKey: 'account.history' },
    { id: 'settings', icon: Settings, labelKey: 'account.settings' },
  ]

  return (
    <div className="min-h-screen bg-background transition-colors duration-500 font-sans text-foreground selection:bg-accent/30 overflow-hidden relative">
      <div className="bg-noise"></div>

      {/* Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[min(800px,80vw)] h-[min(800px,80vw)] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[min(600px,60vw)] h-[min(600px,60vw)] bg-foreground/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 md:px-12 py-8 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-accent hover:text-foreground transition-colors cursor-hover-target">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-[0.3em]">{lang === 'es' ? 'Inicio' : 'Home'}</span>
        </Link>
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-accent" />
          <span className="font-black text-xl tracking-tighter uppercase text-foreground font-michroma">DOGE<span className="text-accent underline underline-offset-4 decoration-2">{lang === 'es' ? 'Cuenta' : 'Account'}</span></span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 md:py-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 md:mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-[1.1] text-foreground font-michroma">
            {t('account.title')} <br className="hidden md:block" /> <span className="silver-text">{t('account.title2')}</span>
          </h1>
          <p className="text-accent text-lg font-medium max-w-2xl leading-relaxed">
            {t('account.subtitle')}
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="luxury-glass p-8 md:p-10 rounded-[32px] mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-foreground/5 flex items-center justify-center border border-accent/10">
              <User className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground uppercase font-michroma">{t('account.guestName')}</h2>
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">{t('account.guestSub')}</span>
            </div>
          </div>
          <Link
            href="/membership"
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:opacity-90 transition-all"
          >
            <Crown className="w-4 h-4" />
            {t('mem.cta')}
          </Link>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex rounded-2xl border border-accent/10 bg-foreground/5 p-1.5 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-foreground text-background shadow-xl'
                    : 'text-accent hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {t(tab.labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="luxury-glass p-8 md:p-10 rounded-[32px] space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">{t('account.name')}</label>
                  <input type="text" placeholder={lang === 'es' ? 'Tu nombre completo' : 'Your full name'} className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">{t('account.email')}</label>
                  <input type="email" placeholder={lang === 'es' ? 'tu@email.com' : 'your@email.com'} className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">{t('account.phone')}</label>
                  <input type="tel" placeholder={lang === 'es' ? 'Tu teléfono' : 'Your phone'} className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-3 block">{t('account.address')}</label>
                  <input type="text" placeholder={lang === 'es' ? 'Dirección de la propiedad' : 'Property address'} className="w-full bg-foreground/5 border border-accent/10 rounded-2xl px-6 py-4 text-foreground font-medium text-base outline-none focus:border-accent/40 transition-colors placeholder:text-accent/30" />
                </div>
                <button className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl font-michroma hover:opacity-90 transition-all">
                  {t('account.saveCta')}
                </button>
              </div>

              {/* Contact Team CTA */}
              <a
                href="https://wa.me/17869283948?text=Hola%20DOGE.S.M%20LLC%2C%20necesito%20ayuda%20con%20mi%20cuenta"
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-glass p-6 rounded-[24px] flex items-center gap-4 hover:border-accent/40 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <MessageCircle className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-grow">
                  <span className="font-black text-sm uppercase tracking-tight text-foreground">{t('account.contactTeam')}</span>
                  <span className="block text-[10px] font-bold text-accent uppercase tracking-widest mt-1">{lang === 'es' ? 'Soporte vía WhatsApp' : 'Support via WhatsApp'}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-accent group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="luxury-glass p-8 md:p-10 rounded-[32px]">
              <div className="text-center py-12 md:py-20">
                <div className="w-20 h-20 bg-accent/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 border border-accent/20">
                  <CreditCard className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase font-michroma mb-4">{t('account.payment')}</h3>
                <p className="text-accent font-medium max-w-md mx-auto mb-8 leading-relaxed">
                  {t('account.paymentDesc')}
                </p>

                {/* Visual Card Preview */}
                <div className="max-w-sm mx-auto mb-8">
                  <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl p-6 border border-white/10 shadow-2xl text-left">
                    <div className="flex justify-between items-start mb-12">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">DOGE.S.M LLC</span>
                      <Shield className="w-6 h-6 text-zinc-600" />
                    </div>
                    <div className="text-lg font-michroma text-zinc-400 tracking-widest mb-4">•••• •••• •••• ••••</div>
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block">{lang === 'es' ? 'Titular' : 'Holder'}</span>
                        <span className="text-xs font-bold text-zinc-400 uppercase">{t('account.guestName')}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block">Exp</span>
                        <span className="text-xs font-bold text-zinc-400">--/--</span>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="https://wa.me/17869283948?text=Hola%20DOGE.S.M%20LLC%2C%20quiero%20configurar%20mi%20m%C3%A9todo%20de%20pago"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:opacity-90 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  {t('account.addPayment')}
                </a>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="luxury-glass p-8 md:p-10 rounded-[32px]">
              <div className="text-center py-12 md:py-20">
                <div className="w-20 h-20 bg-accent/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 border border-accent/20">
                  <History className="w-10 h-10 text-accent" />
                </div>
                <h3 className="text-2xl font-black text-foreground uppercase font-michroma mb-4">{t('account.history')}</h3>
                <p className="text-accent font-medium max-w-md mx-auto mb-8 leading-relaxed">
                  {t('account.historyDesc')}
                </p>

                {/* Empty Timeline Visualization */}
                <div className="max-w-md mx-auto mb-10">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 mb-6 opacity-20">
                      <div className="w-3 h-3 rounded-full bg-accent border-2 border-accent/30 shrink-0"></div>
                      <div className="flex-grow h-[1px] bg-accent/20"></div>
                      <div className="w-24 h-8 bg-foreground/5 rounded-lg border border-accent/10"></div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:opacity-90 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('account.firstService')}
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Language */}
              <div className="luxury-glass p-6 md:p-8 rounded-[24px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center border border-accent/10">
                    <Globe className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <span className="font-black text-sm uppercase tracking-tight text-foreground block">{t('account.language')}</span>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{lang === 'es' ? 'Español' : 'English'}</span>
                  </div>
                </div>
                <button
                  onClick={toggleLang}
                  className="px-5 py-3 rounded-xl border border-accent/10 font-black uppercase text-[10px] tracking-widest text-accent hover:bg-foreground/5 transition-all"
                >
                  {lang === 'es' ? 'EN' : 'ES'}
                </button>
              </div>

              {/* Theme */}
              <div className="luxury-glass p-6 md:p-8 rounded-[24px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center border border-accent/10">
                    {theme === 'dark' ? <Moon className="w-6 h-6 text-accent" /> : <Sun className="w-6 h-6 text-accent" />}
                  </div>
                  <div>
                    <span className="font-black text-sm uppercase tracking-tight text-foreground block">{t('account.theme')}</span>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{theme === 'dark' ? t('account.themeDark') : t('account.themeLight')}</span>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-5 py-3 rounded-xl border border-accent/10 font-black uppercase text-[10px] tracking-widest text-accent hover:bg-foreground/5 transition-all"
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>
              </div>

              {/* Notifications */}
              <div className="luxury-glass p-6 md:p-8 rounded-[24px] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-foreground/5 rounded-xl flex items-center justify-center border border-accent/10">
                    <Bell className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <span className="font-black text-sm uppercase tracking-tight text-foreground block">{t('account.notifications')}</span>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-widest max-w-[200px] block leading-relaxed">{t('account.notifDesc')}</span>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsOn(!notificationsOn)}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${
                    notificationsOn ? 'bg-emerald-500' : 'bg-accent/20'
                  }`}
                >
                  <motion.div
                    animate={{ x: notificationsOn ? 22 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-6 h-6 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-accent/10 py-10 px-6 text-center text-accent/50 text-xs font-bold uppercase tracking-widest bg-background mt-16">
        <p>© {new Date().getFullYear()} DOGE.S.M LLC.</p>
      </footer>
    </div>
  )
}
