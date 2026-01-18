import { useTheme, themes, type ThemeId, type ThemeBase } from '@renderer/contexts/ThemeContext'
import { cn } from '@renderer/lib/utils'
import { Check, Moon, Sun } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'

interface ThemePreviewProps {
  themeId: ThemeId
  isSelected: boolean
  onClick: () => void
}

function ThemePreview({ themeId, isSelected, onClick }: ThemePreviewProps) {
  const theme = themes.find((t) => t.id === themeId)
  if (!theme) return null

  const isDark = theme.mode === 'dark'

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-start rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50',
        isSelected ? 'border-primary bg-primary/5' : 'border-border'
      )}
    >
      {/* Theme preview mini-mockup */}
      <div
        className={cn(
          'mb-3 h-20 w-full rounded-md border overflow-hidden',
          isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-200'
        )}
      >
        {/* Mock header */}
        <div
          className={cn(
            'h-4 flex items-center gap-1 px-2',
            isDark ? 'bg-zinc-800' : 'bg-zinc-100'
          )}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
          <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
        </div>
        {/* Mock content */}
        <div className="p-2 space-y-1">
          <div
            className={cn(
              'h-2 w-3/4 rounded',
              isDark ? 'bg-zinc-700' : 'bg-zinc-200'
            )}
          />
          <div
            className={cn(
              'h-2 w-1/2 rounded',
              isDark ? 'bg-zinc-700' : 'bg-zinc-200'
            )}
          />
          <div
            className={cn(
              'h-4 w-full rounded mt-2',
              isDark ? 'bg-blue-600/30' : 'bg-blue-100'
            )}
          />
        </div>
      </div>

      {/* Theme info */}
      <div className="flex items-center gap-2 w-full">
        <span className="font-medium text-sm">{theme.name}</span>
        {isDark ? (
          <Moon className="h-3 w-3 text-muted-foreground" />
        ) : (
          <Sun className="h-3 w-3 text-muted-foreground" />
        )}
        {isSelected && (
          <Check className="h-4 w-4 text-primary ml-auto" />
        )}
      </div>
      <span className="text-xs text-muted-foreground mt-0.5">{theme.fontFamily}</span>
    </button>
  )
}

interface ThemeGroupProps {
  base: ThemeBase
  label: string
  description: string
}

function ThemeGroup({ base, label, description }: ThemeGroupProps) {
  const { themeId, setTheme } = useTheme()
  const groupThemes = themes.filter((t) => t.base === base)

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-medium text-sm">{label}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>
          Choose your preferred theme. Each theme has light and dark variants.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ThemeGroup
          base="default"
          label="Default"
          description="Clean and modern with blue accents"
        />
        <ThemeGroup
          base="medical"
          label="Medical Professional"
          description="Clinical appearance with IBM Plex Sans"
        />
        <ThemeGroup
          base="classic"
          label="Classic"
          description="Warm tones with Source Serif font"
        />
        <ThemeGroup
          base="minimal"
          label="Minimal"
          description="High contrast with Space Grotesk"
        />
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
