
'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export const FooterSection = ({ theme }: { theme: string }) => {
  return (
    <>
            {/* 5. FOOTER (Noir Minimalist) */}
            <footer className="py-12 md:py-16 relative z-20 border-t border-white/5 bg-[var(--footer-bg)] transition-colors duration-500">
              <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-20">

                <div className="flex flex-col gap-8 max-w-sm">
                  <div className="flex items-center gap-4">
                    <div className={`relative w-12 h-12 flex items-center justify-center invert opacity-80 ${theme === 'light' ? 'invert-0' : 'invert'}`}>
                      <Image src="/doge_logo_premium.png" alt="DOGE Premium Logo" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-michroma text-2xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">DOGE.S.M LLC</span>
                      <span className="font-michroma text-[10px] font-bold tracking-[0.4em] text-accent uppercase mt-1">Cleaning Tactics</span>
                    </div>
                  </div>
                  <p className="text-accent font-medium text-sm leading-relaxed">
                    Servicios de limpieza técnica y preservación de activos de alto nivel. Operando bajo estándares de seguridad de clase mundial en Florida central y sur.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-32">
                  <div className="flex flex-col gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Contact & Dispatch</span>
                    <div className="flex flex-col gap-3 font-bold text-accent text-sm tracking-tight">
                      <a href="mailto:doge.clean.miami@gmail.com" className="hover:text-foreground transition-colors duration-300">doge.clean.miami@gmail.com</a>
                      <a href="tel:7869283948" className="hover:text-foreground transition-colors duration-300 tracking-widest text-lg text-foreground mt-2 font-michroma">786-928-3948</a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Operations</span>
                    <div className="flex flex-col gap-3 font-bold text-accent text-sm">
                      <span className="text-foreground">DAVID SOTOLONGO MARTINEZ</span>
                      <span className="text-accent">Miami, Florida, United States</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-wrap items-center gap-8 text-[9px] font-black text-accent uppercase tracking-[0.3em]">
                  <Link href="/legal/licenses" className="hover:text-foreground transition-colors">Licencias</Link>
                  <Link href="/legal/registry" className="hover:text-foreground transition-colors">Florida Registry</Link>
                  <Link href="/legal/privacy" className="hover:text-foreground transition-colors">Privacidad</Link>
                </div>
                <p className="text-accent font-bold text-[9px] uppercase tracking-[0.2em]">© {new Date().getFullYear()} DOGE.S.M LLC. Titanium Noir Standard.</p>
              </div>
            </footer>
    </>
  );
};
