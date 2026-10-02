'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
})

/**
 * Single owner of the theme.
 *
 * It used to live in `page.tsx`, which meant the toggle only existed on the
 * home page: half a dozen routes read the stored value without being able to
 * change it, and the rest ignored it entirely. The inline script in
 * `layout.tsx` applies the stored theme before first paint, so this reads what
 * is already on `<html>` rather than fighting it and causing a flash.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  useEffect(() => {
    const applied = document.documentElement.dataset.theme
    setThemeState(applied === 'light' ? 'light' : 'dark')
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('doge-theme', next)
    } catch {
      // Private browsing: the theme simply does not persist.
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light')
  }, [setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
