'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, Map, Store, Search, ShieldCheck } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname();

  // Helper to determine if a tab is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return pathname === path;
  };

  const TABS = [
    { name: 'Servicios', href: '/#servicios', icon: Sparkles },
    { name: 'Miami', href: '/#confianza', icon: Map },
    { name: 'Garantía', href: '/#', icon: ShieldCheck },
    { name: 'Búsqueda', href: '/#', icon: Search },
    { name: 'Tienda', href: '/store', icon: Store }
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed navbar on mobile */}
      <div className="h-20 w-full md:hidden"></div>
      
      {/* iOS App Style Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 z-[990] md:hidden pb-safe">
        <div className="flex justify-around items-center h-16 px-2">
          {TABS.map((tab, idx) => {
            const active = isActive(tab.href.split('#')[0] || '/');
            return (
              <Link 
                key={idx} 
                href={tab.href}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 ${active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'} transition-colors`}
              >
                <tab.icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium tracking-tight">
                  {tab.name}
                </span>
              </Link>
            )
          })}
        </div>
        {/* iOS Home Indicator Spacer if needed, using safe-area env vars */}
        <div className="h-[env(safe-area-inset-bottom)] bg-transparent w-full"></div>
      </nav>
    </>
  )
}
