import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

export type ThemeId =
  | 'aurora-light'
  | 'aurora-dark'
  | 'meadow-light'
  | 'meadow-dark'
  | 'bloom-light'
  | 'bloom-dark'
  | 'latte-light'
  | 'latte-dark'
  | 'slate-light'
  | 'slate-dark'
  | 'midnight-light'
  | 'midnight-dark'
  | 'obsidian-light'
  | 'obsidian-dark'
  | 'ocean-light'
  | 'ocean-dark'
  | 'retro-light'
  | 'retro-dark'
  | 'ember-light'
  | 'ember-dark'
  | 'frost-light'
  | 'frost-dark'
  | 'sakura-light'
  | 'sakura-dark'

export type ThemeBase = 'aurora' | 'meadow' | 'bloom' | 'latte' | 'slate' | 'midnight' | 'obsidian' | 'ocean' | 'retro' | 'ember' | 'frost' | 'sakura'
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
    id: 'aurora-light',
    name: 'Aurora',
    base: 'aurora',
    mode: 'light',
    fontFamily: 'Inter',
    description: 'Modern teal with coral accents'
  },
  {
    id: 'aurora-dark',
    name: 'Aurora',
    base: 'aurora',
    mode: 'dark',
    fontFamily: 'Inter',
    description: 'Modern teal with coral accents'
  },
  {
    id: 'meadow-light',
    name: 'Meadow',
    base: 'meadow',
    mode: 'light',
    fontFamily: 'Source Sans 3',
    description: 'Fresh green, earthy and calming'
  },
  {
    id: 'meadow-dark',
    name: 'Meadow',
    base: 'meadow',
    mode: 'dark',
    fontFamily: 'Source Sans 3',
    description: 'Fresh green, earthy and calming'
  },
  {
    id: 'bloom-light',
    name: 'Bloom',
    base: 'bloom',
    mode: 'light',
    fontFamily: 'Inter',
    description: 'Soft pastel rose, gentle and airy'
  },
  {
    id: 'bloom-dark',
    name: 'Bloom',
    base: 'bloom',
    mode: 'dark',
    fontFamily: 'Inter',
    description: 'Soft pastel rose, gentle and airy'
  },
  {
    id: 'latte-light',
    name: 'Latte',
    base: 'latte',
    mode: 'light',
    fontFamily: 'Source Sans 3',
    description: 'Warm coffee browns, cozy and inviting'
  },
  {
    id: 'latte-dark',
    name: 'Latte',
    base: 'latte',
    mode: 'dark',
    fontFamily: 'Source Sans 3',
    description: 'Warm coffee browns, cozy and inviting'
  },
  {
    id: 'slate-light',
    name: 'Slate',
    base: 'slate',
    mode: 'light',
    fontFamily: 'Nunito',
    description: 'Sharp grays, professional and clean'
  },
  {
    id: 'slate-dark',
    name: 'Slate',
    base: 'slate',
    mode: 'dark',
    fontFamily: 'Nunito',
    description: 'Sharp grays, professional and clean'
  },
  {
    id: 'midnight-light',
    name: 'Midnight',
    base: 'midnight',
    mode: 'light',
    fontFamily: 'Nunito',
    description: 'Elegant lavender with purple accents'
  },
  {
    id: 'midnight-dark',
    name: 'Midnight',
    base: 'midnight',
    mode: 'dark',
    fontFamily: 'Nunito',
    description: 'Deep purple, elegant OLED vibes'
  },
  {
    id: 'obsidian-light',
    name: 'Obsidian',
    base: 'obsidian',
    mode: 'light',
    fontFamily: 'Nunito',
    description: 'Pure white with black accents'
  },
  {
    id: 'obsidian-dark',
    name: 'Obsidian',
    base: 'obsidian',
    mode: 'dark',
    fontFamily: 'Nunito',
    description: 'True black AMOLED, minimal'
  },
  {
    id: 'ocean-light',
    name: 'Ocean',
    base: 'ocean',
    mode: 'light',
    fontFamily: 'Inter',
    description: 'Deep blue, calm and professional'
  },
  {
    id: 'ocean-dark',
    name: 'Ocean',
    base: 'ocean',
    mode: 'dark',
    fontFamily: 'Inter',
    description: 'Deep blue, calm and professional'
  },
  {
    id: 'retro-light',
    name: 'Retro',
    base: 'retro',
    mode: 'light',
    fontFamily: 'VT323',
    description: 'Vintage terminal, paper-tape era'
  },
  {
    id: 'retro-dark',
    name: 'Retro',
    base: 'retro',
    mode: 'dark',
    fontFamily: 'VT323',
    description: 'CRT phosphor glow, amber on black'
  },
  {
    id: 'ember-light',
    name: 'Ember',
    base: 'ember',
    mode: 'light',
    fontFamily: 'Nunito',
    description: 'Warm crimson, volcanic energy'
  },
  {
    id: 'ember-dark',
    name: 'Ember',
    base: 'ember',
    mode: 'dark',
    fontFamily: 'Nunito',
    description: 'Molten fire on charred black'
  },
  {
    id: 'frost-light',
    name: 'Frost',
    base: 'frost',
    mode: 'light',
    fontFamily: 'Inter',
    description: 'Crystalline ice, sharp and pure'
  },
  {
    id: 'frost-dark',
    name: 'Frost',
    base: 'frost',
    mode: 'dark',
    fontFamily: 'Inter',
    description: 'Frozen depths, arctic glow'
  },
  {
    id: 'sakura-light',
    name: 'Sakura',
    base: 'sakura',
    mode: 'light',
    fontFamily: 'Source Sans 3',
    description: 'Cherry blossom elegance'
  },
  {
    id: 'sakura-dark',
    name: 'Sakura',
    base: 'sakura',
    mode: 'dark',
    fontFamily: 'Source Sans 3',
    description: 'Twilight petals, zen serenity'
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

// Migration map for old theme IDs to new ones
const themeMapping: Record<string, ThemeId> = {
  // Legacy v1 themes
  'default-light': 'ocean-light',
  'default-dark': 'ocean-dark',
  'medical-light': 'meadow-light',
  'medical-dark': 'meadow-dark',
  'classic-light': 'bloom-light',
  'classic-dark': 'bloom-dark',
  'minimal-light': 'slate-light',
  'minimal-dark': 'slate-dark',
  // Legacy single midnight theme
  'midnight': 'midnight-dark'
}

function getSystemPrefersDark(): boolean {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

function getStoredTheme(): ThemeId | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored) {
      // Check if it's a new theme ID
      if (themes.some((t) => t.id === stored)) {
        return stored as ThemeId
      }
      // Check if it's an old theme ID that needs migration
      if (stored in themeMapping) {
        const migratedTheme = themeMapping[stored]
        // Save the migrated theme
        localStorage.setItem(THEME_STORAGE_KEY, migratedTheme)
        return migratedTheme
      }
    }
  }
  return null
}

function getDefaultTheme(systemDark: boolean): ThemeId {
  return systemDark ? 'ocean-dark' : 'ocean-light'
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
  if (!theme) return 'ocean-dark'
  const newMode = theme.mode === 'light' ? 'dark' : 'light'
  return `${theme.base}-${newMode}` as ThemeId
}

// Helper to get themes grouped by base
export function getThemesByBase(): Record<ThemeBase, Theme[]> {
  return {
    aurora: themes.filter((t) => t.base === 'aurora'),
    meadow: themes.filter((t) => t.base === 'meadow'),
    bloom: themes.filter((t) => t.base === 'bloom'),
    latte: themes.filter((t) => t.base === 'latte'),
    slate: themes.filter((t) => t.base === 'slate'),
    midnight: themes.filter((t) => t.base === 'midnight'),
    obsidian: themes.filter((t) => t.base === 'obsidian'),
    ocean: themes.filter((t) => t.base === 'ocean'),
    retro: themes.filter((t) => t.base === 'retro'),
    ember: themes.filter((t) => t.base === 'ember'),
    frost: themes.filter((t) => t.base === 'frost'),
    sakura: themes.filter((t) => t.base === 'sakura')
  }
}
