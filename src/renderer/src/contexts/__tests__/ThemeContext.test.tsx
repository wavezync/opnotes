import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { ThemeProvider, useTheme, themes, getOppositeTheme, getThemesByBase } from '../ThemeContext'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn()
}))

Object.defineProperty(window, 'matchMedia', { value: matchMediaMock })

// Test component that uses the theme context
function TestComponent() {
  const { theme, themeId, setTheme, toggleMode, isSystemDark } = useTheme()

  return (
    <div>
      <div data-testid="theme-id">{themeId}</div>
      <div data-testid="theme-name">{theme.name}</div>
      <div data-testid="theme-mode">{theme.mode}</div>
      <div data-testid="system-dark">{isSystemDark.toString()}</div>
      <button data-testid="toggle-mode" onClick={toggleMode}>
        Toggle Mode
      </button>
      <button data-testid="set-ocean" onClick={() => setTheme('ocean-light')}>
        Set Ocean
      </button>
    </div>
  )
}

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  describe('themes export', () => {
    it('should export an array of themes', () => {
      expect(Array.isArray(themes)).toBe(true)
      expect(themes.length).toBeGreaterThan(0)
    })

    it('should have themes with required properties', () => {
      themes.forEach((theme) => {
        expect(theme).toHaveProperty('id')
        expect(theme).toHaveProperty('name')
        expect(theme).toHaveProperty('mode')
        expect(theme).toHaveProperty('base')
        expect(['light', 'dark']).toContain(theme.mode)
      })
    })

    it('should have both light and dark variants for each base theme', () => {
      const baseThemes = new Set(themes.map((t) => t.base))

      baseThemes.forEach((base) => {
        const variants = themes.filter((t) => t.base === base)
        const modes = variants.map((v) => v.mode)

        expect(modes).toContain('light')
        expect(modes).toContain('dark')
      })
    })
  })

  describe('getOppositeTheme', () => {
    it('should return dark variant for light theme', () => {
      const opposite = getOppositeTheme('aurora-light')
      expect(opposite).toBe('aurora-dark')
    })

    it('should return light variant for dark theme', () => {
      const opposite = getOppositeTheme('ocean-dark')
      expect(opposite).toBe('ocean-light')
    })
  })

  describe('getThemesByBase', () => {
    it('should group themes by base name', () => {
      const grouped = getThemesByBase()

      expect(typeof grouped).toBe('object')
      Object.keys(grouped).forEach((base) => {
        // Each base should have an array of themes
        expect(Array.isArray(grouped[base as keyof typeof grouped])).toBe(true)
        // Each base should have both light and dark variants
        const themesForBase = grouped[base as keyof typeof grouped]
        const modes = themesForBase.map((t) => t.mode)
        expect(modes).toContain('light')
        expect(modes).toContain('dark')
      })
    })
  })

  describe('ThemeProvider', () => {
    it('should provide default theme when no preference is saved', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Should have a valid theme
      expect(screen.getByTestId('theme-id')).toBeDefined()
      expect(screen.getByTestId('theme-name')).toBeDefined()
    })

    it('should restore theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('ocean-dark')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme-id')).toHaveTextContent('ocean-dark')
    })

    it('should set data-theme attribute on document', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(document.documentElement.getAttribute('data-theme')).toBeDefined()
    })

    it('should toggle between light and dark mode', () => {
      localStorageMock.getItem.mockReturnValue('aurora-light')

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light')

      act(() => {
        fireEvent.click(screen.getByTestId('toggle-mode'))
      })

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark')
    })

    it('should allow changing theme', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      act(() => {
        fireEvent.click(screen.getByTestId('set-ocean'))
      })

      expect(screen.getByTestId('theme-id')).toHaveTextContent('ocean-light')
    })

    it('should save theme to localStorage on change', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      act(() => {
        fireEvent.click(screen.getByTestId('set-ocean'))
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith('app_theme', 'ocean-light')
    })

    it('should detect system dark mode preference', () => {
      matchMediaMock.mockImplementation((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('system-dark')).toHaveTextContent('true')
    })
  })

  describe('useTheme hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow()

      consoleSpy.mockRestore()
    })
  })
})
