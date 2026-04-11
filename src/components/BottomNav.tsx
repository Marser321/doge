'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Map, Store, Search, ShieldCheck } from 'lucide-react'
import { useLanguage } from './LanguageProvider'

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Helper to determine if a tab is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return pathname === path;
  };

  const TABS = [
    { name: t('bnav.services'), href: '/services', icon: Sparkles, disabled: false },
    { name: t('bnav.miami'), href: '/#confianza', icon: Map, disabled: false },
    { name: t('bnav.guarantee'), href: '', icon: ShieldCheck, disabled: true },
    { name: t('bnav.search'), href: '', icon: Search, disabled: true },
    { name: t('bnav.store'), href: '/store', icon: Store, disabled: false }
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed navbar on mobile */}
      <div className="h-20 w-full md:hidden"></div>
      
      {/* iOS App Style Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-zinc-950/80 backdrop-blur-2xl border-t border-white/5 z-[990] md:hidden pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {TABS.map((tab, idx) => {
            const active = !tab.disabled && isActive(tab.href.split('#')[0] || '/');
            const className = `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              tab.disabled
                ? 'text-zinc-700 cursor-not-allowed'
                : active
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
            }`;

            if (tab.disabled) {
              return (
                <button
                  key={idx}
                  type="button"
                  disabled
                  aria-label={`${tab.name} próximamente`}
                  className={className}
                >
                  <tab.icon className="w-6 h-6 opacity-40" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold tracking-tight uppercase opacity-40">
                    {tab.name}
                  </span>
                </button>
              );
            }

            return (
              <Link key={idx} href={tab.href} className={className}>
                <tab.icon className={`w-6 h-6 ${active ? 'opacity-100' : 'opacity-60'}`} strokeWidth={active ? 2.5 : 1.5} />
                <span className={`text-[10px] font-bold tracking-tight uppercase ${active ? 'opacity-100' : 'opacity-60'}`}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* iOS Home Indicator Spacer if needed, using safe-area env vars */}
        <div className="h-[env(safe-area-inset-bottom)] bg-transparent w-full"></div>
      </nav>
    </>
  )
}
