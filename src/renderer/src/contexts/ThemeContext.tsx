import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemeId =
  | 'default-light'
  | 'default-dark'
  | 'medical-light'
  | 'medical-dark'
  | 'classic-light'
  | 'classic-dark'
  | 'minimal-light'
  | 'minimal-dark'

export type ThemeBase = 'default' | 'medical' | 'classic' | 'minimal'
export type ThemeMode = 'light' | 'dark'

export interface Theme {
  id: ThemeId
  name: string
  base: ThemeBase
  mode: ThemeMode
  fontFamily: string
  description: string
}

export const themes: Theme[] = [
  {
    id: 'default-light',
    name: 'Default Light',
    base: 'default',
    mode: 'light',
    fontFamily: 'Inter',
    description: 'Clean and modern with blue accents'
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    base: 'default',
    mode: 'dark',
    fontFamily: 'Inter',
    description: 'Dark blue-gray palette'
  },
  {
    id: 'medical-light',
    name: 'Medical Light',
    base: 'medical',
    mode: 'light',
    fontFamily: 'IBM Plex Sans',
    description: 'Professional clinical appearance'
  },
  {
    id: 'medical-dark',
    name: 'Medical Dark',
    base: 'medical',
    mode: 'dark',
    fontFamily: 'IBM Plex Sans',
    description: 'Deep blue-green dark mode'
  },
  {
    id: 'classic-light',
    name: 'Classic Light',
    base: 'classic',
    mode: 'light',
    fontFamily: 'Source Serif 4',
    description: 'Warm paper-like background'
  },
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    base: 'classic',
    mode: 'dark',
    fontFamily: 'Source Serif 4',
    description: 'Warm dark tones'
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    base: 'minimal',
    mode: 'light',
    fontFamily: 'Space Grotesk',
    description: 'Pure white, sharp contrasts'
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    base: 'minimal',
    mode: 'dark',
    fontFamily: 'Space Grotesk',
    description: 'True black, high contrast'
  }
]

interface ThemeContextValue {
  theme: Theme
  themeId: ThemeId
  setTheme: (themeId: ThemeId) => void
  toggleMode: () => void
  themes: Theme[]
  isSystemDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = 'app_theme'

function getSystemPrefersDark(): boolean {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

function getStoredTheme(): ThemeId | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && themes.some((t) => t.id === stored)) {
      return stored as ThemeId
    }
  }
  return null
}

function getDefaultTheme(systemDark: boolean): ThemeId {
  return systemDark ? 'default-dark' : 'default-light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isSystemDark, setIsSystemDark] = useState(getSystemPrefersDark)
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const stored = getStoredTheme()
    return stored || getDefaultTheme(getSystemPrefersDark())
  })

  const theme = themes.find((t) => t.id === themeId) || themes[0]

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeId)
    localStorage.setItem(THEME_STORAGE_KEY, themeId)
  }, [themeId])

  const setTheme = useCallback((newThemeId: ThemeId) => {
    setThemeId(newThemeId)
  }, [])

  const toggleMode = useCallback(() => {
    const currentTheme = themes.find((t) => t.id === themeId)
    if (currentTheme) {
      const newMode = currentTheme.mode === 'light' ? 'dark' : 'light'
      const newThemeId = `${currentTheme.base}-${newMode}` as ThemeId
      setThemeId(newThemeId)
    }
  }, [themeId])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        setTheme,
        toggleMode,
        themes,
        isSystemDark
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Helper to get the opposite mode theme
export function getOppositeTheme(themeId: ThemeId): ThemeId {
  const theme = themes.find((t) => t.id === themeId)
  if (!theme) return 'default-light'
  const newMode = theme.mode === 'light' ? 'dark' : 'light'
  return `${theme.base}-${newMode}` as ThemeId
}

// Helper to get themes grouped by base
export function getThemesByBase(): Record<ThemeBase, Theme[]> {
  return {
    default: themes.filter((t) => t.base === 'default'),
    medical: themes.filter((t) => t.base === 'medical'),
    classic: themes.filter((t) => t.base === 'classic'),
    minimal: themes.filter((t) => t.base === 'minimal')
  }
}
