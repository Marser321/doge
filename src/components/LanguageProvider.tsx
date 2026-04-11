'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { type Lang, type TranslationKey, t as translate } from '@/data/i18n'

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'es',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
})

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'es'
  const saved = localStorage.getItem('doge-lang')
  if (saved === 'en' || saved === 'es') return saved
  return 'es'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    localStorage.setItem('doge-lang', newLang)
    document.documentElement.lang = newLang
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'es' ? 'en' : 'es')
  }, [lang, setLang])

  const t = useCallback((key: TranslationKey) => {
    return translate(key, lang)
  }, [lang])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
