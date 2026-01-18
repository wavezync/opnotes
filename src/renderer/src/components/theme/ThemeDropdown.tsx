import { useTheme, type ThemeId, type ThemeBase } from '@renderer/contexts/ThemeContext'
import { cn } from '@renderer/lib/utils'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@renderer/components/ui/popover'
import { useState } from 'react'

// Theme visual data with gradients and preview colors
const themeVisuals: Record<
  ThemeBase,
  {
    gradient: string
    preview: { bg: string; accent: string; text: string }
    icon: string
  }
> = {
  aurora: {
    gradient: 'from-cyan-400 via-teal-500 to-emerald-500',
    preview: { bg: '#f5f9fa', accent: '#2d9ea8', text: '#1a3035' },
    icon: '🌊'
  },
  meadow: {
    gradient: 'from-green-400 via-emerald-500 to-teal-600',
    preview: { bg: '#f4f8f5', accent: '#4a9960', text: '#1a2820' },
    icon: '🌿'
  },
  bloom: {
    gradient: 'from-pink-300 via-rose-400 to-pink-500',
    preview: { bg: '#faf5f7', accent: '#d87a9e', text: '#2a1820' },
    icon: '🌸'
  },
  latte: {
    gradient: 'from-amber-300 via-orange-400 to-amber-600',
    preview: { bg: '#f8f4f0', accent: '#8a6a4a', text: '#2a2018' },
    icon: '☕'
  },
  slate: {
    gradient: 'from-slate-400 via-gray-500 to-zinc-600',
    preview: { bg: '#f9f9fa', accent: '#3a3d45', text: '#1a1a1c' },
    icon: '🔲'
  },
  midnight: {
    gradient: 'from-purple-500 via-violet-600 to-indigo-700',
    preview: { bg: '#f8f5fa', accent: '#a87ce8', text: '#2a1830' },
    icon: '🌙'
  },
  obsidian: {
    gradient: 'from-zinc-400 via-neutral-600 to-stone-800',
    preview: { bg: '#000000', accent: '#ffffff', text: '#a0a0a0' },
    icon: '⬛'
  },
  ocean: {
    gradient: 'from-blue-400 via-indigo-500 to-blue-600',
    preview: { bg: '#f0f5fa', accent: '#2a6ab8', text: '#1a2530' },
    icon: '🌊'
  },
  retro: {
    gradient: 'from-amber-400 via-yellow-500 to-green-500',
    preview: { bg: '#1a1408', accent: '#4aff4a', text: '#ffcc00' },
    icon: '📺'
  }
}

const themeLabels: Record<ThemeBase, { name: string; tagline: string }> = {
  aurora: { name: 'Aurora', tagline: 'Modern & crisp' },
  meadow: { name: 'Meadow', tagline: 'Fresh & natural' },
  bloom: { name: 'Bloom', tagline: 'Soft & gentle' },
  latte: { name: 'Latte', tagline: 'Warm & cozy' },
  slate: { name: 'Slate', tagline: 'Sharp & clean' },
  midnight: { name: 'Midnight', tagline: 'Purple elegance' },
  obsidian: { name: 'Obsidian', tagline: 'True black AMOLED' },
  ocean: { name: 'Ocean', tagline: 'Calm & professional' },
  retro: { name: 'Retro', tagline: 'CRT nostalgia' }
}

interface ThemeCardProps {
  base: ThemeBase
  isSelected: boolean
  currentMode: 'light' | 'dark'
  onSelect: (themeId: ThemeId) => void
}

function ThemeCard({ base, isSelected, currentMode, onSelect }: ThemeCardProps) {
  const visuals = themeVisuals[base]
  const labels = themeLabels[base]
  const themeId = `${base}-${currentMode}` as ThemeId

  return (
    <button
      onClick={() => onSelect(themeId)}
      className={cn(
        'group relative flex flex-col rounded-xl p-2 transition-all duration-300',
        'hover:scale-[1.02] active:scale-[0.98]',
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'hover:bg-accent/50'
      )}
    >
      {/* Theme preview card */}
      <div
        className={cn(
          'relative h-16 w-full rounded-lg overflow-hidden',
          'shadow-sm transition-shadow duration-300 group-hover:shadow-md'
        )}
        style={{ backgroundColor: visuals.preview.bg }}
      >
        {/* Mini UI mockup */}
        <div className="absolute inset-0 p-1.5">
          {/* Sidebar mock */}
          <div
            className="absolute left-0 top-0 bottom-0 w-4 rounded-l-md opacity-80"
            style={{ backgroundColor: visuals.preview.accent + '20' }}
          >
            <div
              className="m-0.5 h-2 w-2 rounded-sm"
              style={{ backgroundColor: visuals.preview.accent }}
            />
          </div>
          {/* Header mock */}
          <div
            className="absolute top-0 left-5 right-0 h-3 rounded-tr-md opacity-40"
            style={{ backgroundColor: visuals.preview.accent }}
          />
          {/* Content mock */}
          <div className="absolute top-4 left-5 right-1 bottom-1 flex flex-col gap-0.5">
            <div
              className="h-1.5 w-3/4 rounded-sm opacity-60"
              style={{ backgroundColor: visuals.preview.text }}
            />
            <div
              className="h-1.5 w-1/2 rounded-sm opacity-40"
              style={{ backgroundColor: visuals.preview.text }}
            />
            <div
              className="mt-auto h-3 w-full rounded-sm opacity-80"
              style={{ backgroundColor: visuals.preview.accent }}
            />
          </div>
        </div>

        {/* Gradient overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300',
            'group-hover:opacity-20',
            visuals.gradient
          )}
        />

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />
          </div>
        )}
      </div>

      {/* Theme info */}
      <div className="mt-1.5 flex items-center gap-1.5 px-0.5">
        <span className="text-sm">{visuals.icon}</span>
        <div className="flex-1 text-left">
          <div className="text-xs font-semibold leading-tight">{labels.name}</div>
          <div className="text-[10px] text-muted-foreground leading-tight">{labels.tagline}</div>
        </div>
      </div>
    </button>
  )
}

export function ThemeDropdown() {
  const { theme, setTheme, toggleMode } = useTheme()
  const [open, setOpen] = useState(false)
  const isDark = theme.mode === 'dark'
  const currentVisuals = themeVisuals[theme.base]

  // All 9 themes
  const allThemes: ThemeBase[] = ['aurora', 'meadow', 'bloom', 'latte', 'slate', 'midnight', 'obsidian', 'ocean', 'retro']

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 relative overflow-hidden transition-all duration-300',
            'hover:bg-accent/50',
            open && 'bg-accent'
          )}
        >
          {/* Animated gradient background */}
          <div
            className={cn(
              'absolute inset-0.5 rounded-md bg-gradient-to-br opacity-0 transition-opacity duration-300',
              'group-hover:opacity-100',
              currentVisuals.gradient
            )}
          />
          <Sparkles className="h-4 w-4 relative z-10" />
          {/* Theme color indicator */}
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full',
              'border-2 border-background',
              `bg-gradient-to-br ${currentVisuals.gradient}`
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[340px] p-3"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold">Theme</h4>
            <p className="text-xs text-muted-foreground">
              Choose your visual style
            </p>
          </div>
          {/* Mode toggle pill */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-muted">
            <button
              onClick={() => {
                if (isDark) {
                  toggleMode()
                }
              }}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
                !isDark
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Light
            </button>
            <button
              onClick={() => {
                if (!isDark) {
                  toggleMode()
                }
              }}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200',
                isDark
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Theme grid - 3x3 for 9 themes */}
        <div className="grid grid-cols-3 gap-2">
          {allThemes.map((base) => {
            const isCurrentBase = theme.base === base
            return (
              <ThemeCard
                key={base}
                base={base}
                isSelected={isCurrentBase}
                currentMode={isDark ? 'dark' : 'light'}
                onSelect={(id) => {
                  setTheme(id)
                  setOpen(false)
                }}
              />
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
