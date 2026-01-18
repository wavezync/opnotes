import { useTheme, themes, type ThemeId, type ThemeBase } from '@renderer/contexts/ThemeContext'
import { cn } from '@renderer/lib/utils'
import { Check, Moon, Sun, Monitor } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'

// Theme preview colors matching the actual theme CSS
const themePreviewColors: Record<ThemeBase, {
  light: { bg: string; card: string; primary: string; accent: string; border: string; muted: string; text: string }
  dark: { bg: string; card: string; primary: string; accent: string; border: string; muted: string; text: string }
}> = {
  aurora: {
    light: { bg: '#f5f9fa', card: '#ffffff', primary: '#2d9ea8', accent: '#e67a5a', border: '#d8e8eb', muted: '#e8f2f4', text: '#1a3035' },
    dark: { bg: '#1a2428', card: '#1f2a30', primary: '#4dc8d2', accent: '#f09080', border: '#2a3840', muted: '#243038', text: '#e8f4f6' }
  },
  meadow: {
    light: { bg: '#f4f8f5', card: '#fafdfb', primary: '#4a9960', accent: '#c9a84c', border: '#d8e8dc', muted: '#e4f0e7', text: '#1a2820' },
    dark: { bg: '#1a2420', card: '#1f2a24', primary: '#6ab87a', accent: '#ddc06c', border: '#2a3830', muted: '#243028', text: '#e4f4e8' }
  },
  bloom: {
    light: { bg: '#faf5f7', card: '#fefcfd', primary: '#d87a9e', accent: '#e8b090', border: '#f0dfe5', muted: '#f8e8ee', text: '#2a1820' },
    dark: { bg: '#221a20', card: '#281f26', primary: '#e8a0b8', accent: '#f0c8b0', border: '#382832', muted: '#302028', text: '#f4e4ec' }
  },
  latte: {
    light: { bg: '#f8f4f0', card: '#fdfbf9', primary: '#8a6a4a', accent: '#c8a060', border: '#e8dcd0', muted: '#f0e8e0', text: '#2a2018' },
    dark: { bg: '#221c18', card: '#28221e', primary: '#c8a080', accent: '#e0c090', border: '#382e28', muted: '#302820', text: '#f4ece4' }
  },
  slate: {
    light: { bg: '#f9f9fa', card: '#ffffff', primary: '#3a3d45', accent: '#5a8ec8', border: '#e4e4e8', muted: '#eeeef0', text: '#1a1a1c' },
    dark: { bg: '#1a1a1c', card: '#222224', primary: '#e8e8ec', accent: '#6aa0d8', border: '#32323a', muted: '#2a2a30', text: '#f0f0f2' }
  },
  midnight: {
    light: { bg: '#f8f5fa', card: '#fefcff', primary: '#8a5cc8', accent: '#6040a0', border: '#e8dff0', muted: '#f0e8f5', text: '#2a1838' },
    dark: { bg: '#0d0810', card: '#18121a', primary: '#a87ce8', accent: '#7a5ac0', border: '#2a2030', muted: '#221828', text: '#e8e0f0' }
  },
  obsidian: {
    light: { bg: '#fafafa', card: '#ffffff', primary: '#1a1a1a', accent: '#404040', border: '#e0e0e0', muted: '#f0f0f0', text: '#1a1a1a' },
    dark: { bg: '#000000', card: '#0a0a0a', primary: '#ffffff', accent: '#808080', border: '#1a1a1a', muted: '#121212', text: '#f0f0f0' }
  },
  ocean: {
    light: { bg: '#f0f5fa', card: '#fafcff', primary: '#2a6ab8', accent: '#1a4a90', border: '#d0e0f0', muted: '#e0ecf5', text: '#1a2530' },
    dark: { bg: '#0a1420', card: '#101a28', primary: '#4a90d8', accent: '#3070b8', border: '#1a2a40', muted: '#142030', text: '#e0ecf5' }
  },
  retro: {
    light: { bg: '#f5f0e8', card: '#faf8f4', primary: '#4a8a4a', accent: '#c8a040', border: '#d8d0c0', muted: '#e8e0d4', text: '#2a2818' },
    dark: { bg: '#1a1408', card: '#201a10', primary: '#4aff4a', accent: '#ffcc00', border: '#3a3020', muted: '#282018', text: '#e0c880' }
  },
  ember: {
    light: { bg: '#f8f2f0', card: '#fdfaf9', primary: '#c83030', accent: '#e86030', border: '#e8d8d0', muted: '#f0e4e0', text: '#2a1818' },
    dark: { bg: '#1a0a08', card: '#201210', primary: '#ff6a35', accent: '#ff9050', border: '#3a2018', muted: '#281810', text: '#ffd0b0' }
  },
  frost: {
    light: { bg: '#f5f8fa', card: '#fafcff', primary: '#4090d0', accent: '#60a8e8', border: '#d0e0f0', muted: '#e8f0f8', text: '#1a2830' },
    dark: { bg: '#0a1420', card: '#101a28', primary: '#6bb8e8', accent: '#90d0ff', border: '#1a2a40', muted: '#142030', text: '#e0f0ff' }
  },
  sakura: {
    light: { bg: '#faf5f8', card: '#fefcfd', primary: '#d87090', accent: '#e890b0', border: '#f0dfe8', muted: '#f8e8f0', text: '#2a1820' },
    dark: { bg: '#1a0a14', card: '#201018', primary: '#e890b0', accent: '#f0b0c8', border: '#382030', muted: '#281820', text: '#ffe8f0' }
  }
}

const themeMetadata: Record<ThemeBase, { icon: string; name: string; description: string }> = {
  aurora: { icon: '🌊', name: 'Aurora', description: 'Modern teal with coral accents' },
  meadow: { icon: '🌿', name: 'Meadow', description: 'Fresh green, earthy and calming' },
  bloom: { icon: '🌸', name: 'Bloom', description: 'Soft pastel rose, gentle and airy' },
  latte: { icon: '☕', name: 'Latte', description: 'Warm coffee browns, cozy and inviting' },
  slate: { icon: '🔲', name: 'Slate', description: 'Sharp grays, professional and clean' },
  midnight: { icon: '🌙', name: 'Midnight', description: 'Elegant purple, sophisticated vibes' },
  obsidian: { icon: '⬛', name: 'Obsidian', description: 'True black AMOLED, minimal' },
  ocean: { icon: '🌊', name: 'Ocean', description: 'Deep blue, calm and professional' },
  retro: { icon: '📺', name: 'Retro', description: 'CRT terminal nostalgia, vintage feel' },
  ember: { icon: '🔥', name: 'Ember', description: 'Volcanic fire, molten energy' },
  frost: { icon: '❄️', name: 'Frost', description: 'Arctic ice, crystalline cold' },
  sakura: { icon: '🌸', name: 'Sakura', description: 'Cherry blossom elegance, zen serenity' }
}

interface ThemePreviewProps {
  themeId: ThemeId
  isSelected: boolean
  onClick: () => void
}

function ThemePreview({ themeId, isSelected, onClick }: ThemePreviewProps) {
  const theme = themes.find((t) => t.id === themeId)
  if (!theme) return null

  const isDark = theme.mode === 'dark'
  const colors = isDark
    ? themePreviewColors[theme.base].dark
    : themePreviewColors[theme.base].light
  const meta = themeMetadata[theme.base]

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-start rounded-xl border-2 p-3 text-left',
        'transition-all duration-300 ease-out',
        'hover:scale-[1.02] active:scale-[0.98]',
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
          : 'border-border hover:border-primary/30 hover:shadow-md'
      )}
    >
      {/* Theme preview mini-mockup */}
      <div
        className={cn(
          'mb-3 h-28 w-full rounded-lg border overflow-hidden',
          'transition-shadow duration-300'
        )}
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        {/* Mock header */}
        <div
          className="h-6 flex items-center gap-1.5 px-2"
          style={{ backgroundColor: colors.muted }}
        >
          <div className="h-2 w-2 rounded-full bg-red-400/80" />
          <div className="h-2 w-2 rounded-full bg-yellow-400/80" />
          <div className="h-2 w-2 rounded-full bg-green-400/80" />
          <div
            className="ml-auto h-2.5 w-10 rounded-sm opacity-60"
            style={{ backgroundColor: colors.primary }}
          />
        </div>
        {/* Mock content with sidebar */}
        <div className="flex h-[calc(100%-24px)]">
          {/* Mini sidebar */}
          <div
            className="w-8 border-r flex flex-col gap-1 p-1"
            style={{ backgroundColor: colors.muted, borderColor: colors.border }}
          >
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="h-4 w-4 rounded opacity-40"
              style={{ backgroundColor: colors.text }}
            />
            <div
              className="h-4 w-4 rounded opacity-40"
              style={{ backgroundColor: colors.text }}
            />
          </div>
          {/* Main content */}
          <div className="flex-1 p-2" style={{ backgroundColor: colors.card }}>
            <div className="flex gap-2 mb-2">
              <div
                className="h-7 w-12 rounded opacity-20"
                style={{ backgroundColor: colors.primary }}
              />
              <div
                className="h-7 w-12 rounded"
                style={{ backgroundColor: colors.muted }}
              />
              <div
                className="h-7 w-12 rounded"
                style={{ backgroundColor: colors.muted }}
              />
            </div>
            <div
              className="h-2 w-3/4 rounded-sm mb-1.5 opacity-60"
              style={{ backgroundColor: colors.text }}
            />
            <div
              className="h-2 w-1/2 rounded-sm mb-3 opacity-40"
              style={{ backgroundColor: colors.text }}
            />
            <div
              className="h-6 w-full rounded opacity-90"
              style={{ backgroundColor: colors.accent }}
            />
          </div>
        </div>
      </div>

      {/* Theme info */}
      <div className="flex items-center gap-2 w-full">
        <span className="text-lg">{meta.icon}</span>
        <span className="font-semibold text-sm">{theme.name}</span>
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        {isSelected && (
          <div className="ml-auto h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
          </div>
        )}
      </div>
      <span className="text-[11px] text-muted-foreground mt-0.5 pl-7">
        {theme.fontFamily}
      </span>
    </button>
  )
}

interface ThemeGroupProps {
  base: ThemeBase
}

function ThemeGroup({ base }: ThemeGroupProps) {
  const { themeId, setTheme } = useTheme()
  const groupThemes = themes.filter((t) => t.base === base)
  const meta = themeMetadata[base]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{meta.icon}</span>
        <div>
          <h4 className="font-semibold text-sm">{meta.name}</h4>
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        </div>
      </div>
      <div className="grid gap-3 grid-cols-2">
        {groupThemes.map((theme) => (
          <ThemePreview
            key={theme.id}
            themeId={theme.id}
            isSelected={themeId === theme.id}
            onClick={() => setTheme(theme.id)}
          />
        ))}
      </div>
    </div>
  )
}

export function ThemeSwitcher() {
  // All 12 themes
  const allThemes: ThemeBase[] = ['aurora', 'meadow', 'bloom', 'latte', 'slate', 'midnight', 'obsidian', 'ocean', 'retro', 'ember', 'frost', 'sakura']

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Theme</CardTitle>
            <CardDescription>
              Choose your visual style. Each theme has unique colors, typography, and character.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {allThemes.map((base) => (
          <ThemeGroup key={base} base={base} />
        ))}
      </CardContent>
    </Card>
  )
}

export function ThemeQuickSwitcher() {
  const { theme, toggleMode } = useTheme()
  const isDark = theme.mode === 'dark'

  return (
    <button
      onClick={toggleMode}
      className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
    >
      {isDark ? (
        <>
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </>
      )}
    </button>
  )
}
