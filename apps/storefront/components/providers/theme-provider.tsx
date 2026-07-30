'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Theme, ThemeSource } from '@corecart/shared/src/theme/types'
import { getThemeResolver } from '@corecart/shared/src/theme/resolver'
import { generateThemeCSS } from '@corecart/shared/src/theme/css-generator'
import { ThemeStudio } from '@/components/theme/theme-studio'

type ThemeContextValue = {
  themeId: string
  activeTheme: Theme | null
  setTheme: (id: string) => void
  favoriteThemes: string[]
  toggleFavorite: (id: string) => void
  themeStudioOpen: boolean
  setThemeStudioOpen: (open: boolean) => void
  themes: Theme[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>('smartgo-default')
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null)
  const [themes, setThemes] = useState<Theme[]>([])
  const [favoriteThemes, setFavoriteThemes] = useState<string[]>([])
  const [themeStudioOpen, setThemeStudioOpen] = useState(false)
  const [resolver] = useState<ThemeSource>(getThemeResolver())

  useEffect(() => {
    // Load themes from resolver
    resolver.getThemes().then(loadedThemes => {
      setThemes(loadedThemes)
      
      const storedId = (typeof window !== 'undefined' && window.localStorage.getItem('smartgo-theme')) as string | null
      const storedFavs = (typeof window !== 'undefined' && window.localStorage.getItem('smartgo-theme-favorites'))
      
      if (storedFavs) {
        try { setFavoriteThemes(JSON.parse(storedFavs)) } catch {}
      }

      if (storedId && loadedThemes.some(t => t.id === storedId)) {
        setThemeIdState(storedId)
        setActiveTheme(loadedThemes.find(t => t.id === storedId) || loadedThemes[0])
      } else {
        const initialTheme = loadedThemes[0]
        setThemeIdState(initialTheme.id)
        setActiveTheme(initialTheme)
      }
    })
  }, [resolver])

  useEffect(() => {
    if (!activeTheme) return
    
    // Inject the generated CSS variables into the document
    const root = document.documentElement
    
    // Manage color-scheme for native inputs/scrollbars
    root.style.colorScheme = activeTheme.isDark ? 'dark' : 'light'

    // We can inject a dynamic style tag for the CSS variables
    let styleEl = document.getElementById('smartgo-theme-vars')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'smartgo-theme-vars'
      document.head.appendChild(styleEl)
    }
    
    styleEl.innerHTML = generateThemeCSS(activeTheme, ':root')

    try {
      window.localStorage.setItem('smartgo-theme', activeTheme.id)
    } catch {
      // ignore
    }
  }, [activeTheme])

  useEffect(() => {
    try {
      window.localStorage.setItem('smartgo-theme-favorites', JSON.stringify(favoriteThemes))
    } catch {}
  }, [favoriteThemes])

  const setTheme = useCallback((id: string) => {
    const nextTheme = themes.find(t => t.id === id)
    if (nextTheme) {
      setThemeIdState(id)
      setActiveTheme(nextTheme)
    }
  }, [themes])

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteThemes(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }, [])

  return (
    <ThemeContext.Provider value={{ 
      themeId, 
      activeTheme, 
      setTheme, 
      favoriteThemes,
      toggleFavorite,
      themeStudioOpen, 
      setThemeStudioOpen,
      themes 
    }}>
      {children}
      <ThemeStudio />
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
