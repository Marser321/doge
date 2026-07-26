'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Sparkles, ShoppingCart, ArrowRight, Crown } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import { SERVICES } from '@/content/services'
import { STORE_DEPARTMENTS } from '@/content/store-taxonomy'

interface SearchResult {
  title: string
  desc: string
  href: string
  category: 'services' | 'products' | 'pages'
  icon: typeof Sparkles
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { lang, t } = useLanguage()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
    if (!isOpen) {
      setTimeout(() => setQuery(''), 0);
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const allResults: SearchResult[] = useMemo(() => [
    // Services
    ...SERVICES.map((service): SearchResult => ({
      title: service.name[lang],
      desc: service.searchDescription[lang],
      href: `/services/${service.id}`,
      category: 'services',
      icon: service.icon,
    })),
    // Store departments
    ...STORE_DEPARTMENTS.map((department): SearchResult => ({
      title: department.label[lang],
      desc: department.subcategories.map((subcategory) => subcategory.label[lang]).join(' · '),
      href: `/store?dept=${department.id}`,
      category: 'products',
      icon: department.icon,
    })),
    // Pages
    {
      title: lang === 'es' ? 'Membresías' : 'Memberships',
      desc: lang === 'es' ? 'Planes Bronce, Plata y Oro VIP' : 'Bronze, Silver and Gold VIP plans',
      href: '/membership',
      category: 'pages',
      icon: Crown,
    },
    {
      title: lang === 'es' ? 'Tienda' : 'Store',
      desc: lang === 'es' ? 'Arsenal de mantenimiento profesional' : 'Professional maintenance arsenal',
      href: '/store',
      category: 'pages',
      icon: ShoppingCart,
    },
    {
      title: lang === 'es' ? 'Agendar Cuadrilla' : 'Schedule a Crew',
      desc: lang === 'es' ? 'Concierge de sanitización' : 'Sanitation concierge',
      href: '/booking',
      category: 'pages',
      icon: Sparkles,
    },
  ], [lang])

  const filtered = useMemo(() => {
    if (!query.trim()) return allResults
    const q = query.toLowerCase()
    return allResults.filter(
      r => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)
    )
  }, [query, allResults])

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  }, [filtered])

  const categoryLabel = (cat: string) => {
    switch (cat) {
      case 'services': return t('search.services')
      case 'products': return t('search.products')
      case 'pages': return t('search.pages')
      default: return cat
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-2xl flex items-start justify-center pt-20 md:pt-32 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.96, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-4 p-6 border-b border-white/5">
              <Search className="w-6 h-6 text-accent shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-grow bg-transparent text-foreground font-medium text-lg outline-none placeholder:text-accent/30"
              />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-4 h-4 text-accent" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-10 h-10 text-accent/20 mx-auto mb-4" />
                  <p className="text-accent font-bold text-sm uppercase tracking-widest">{t('search.noResults')}</p>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) => (
                  <div key={category} className="mb-6 last:mb-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent/50 px-3 mb-3 block">
                      {categoryLabel(category)}
                    </span>
                    <div className="space-y-1">
                      {items.map((item, idx) => (
                        <Link
                          key={idx}
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                            <item.icon className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <span className="font-black text-sm text-foreground uppercase tracking-tight block truncate">{item.title}</span>
                            <span className="text-[10px] font-bold text-accent/60 uppercase tracking-widest truncate block">{item.desc}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-accent/30 group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[9px] font-black text-accent/30 uppercase tracking-widest">
                {filtered.length} {lang === 'es' ? 'resultados' : 'results'}
              </span>
              <span className="text-[9px] font-black text-accent/30 uppercase tracking-widest">
                ESC {lang === 'es' ? 'para cerrar' : 'to close'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
