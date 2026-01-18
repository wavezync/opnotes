import { Moon, Sun, Search } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { useTheme } from '@renderer/contexts/ThemeContext'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { UpdateIndicator } from '@renderer/components/update/UpdateIndicator'

interface HeaderProps {
  onSearchClick?: () => void
}

export function Header({ onSearchClick }: HeaderProps) {
  const { theme, toggleMode } = useTheme()
  const { appVersion, settings } = useSettings()
  const isDark = theme.mode === 'dark'

  const hospitalName = settings?.['hospital'] || ''
  const unitName = settings?.['unit'] || ''

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      {/* Left: Hospital & Department in two rows */}
      <div className="flex flex-col justify-center min-w-0 flex-1">
        {(hospitalName || unitName) ? (
          <>
            <span className="text-sm font-semibold leading-tight truncate">{hospitalName}</span>
            {unitName && (
              <span className="text-xs text-muted-foreground leading-tight truncate">{unitName}</span>
            )}
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Op Notes</span>
        )}
      </div>

      {/* Center: Search trigger */}
      <Button
        variant="outline"
        className="w-72 h-9 justify-start text-muted-foreground bg-muted/50 border-border/50 hover:bg-muted hover:border-border mx-4"
        onClick={onSearchClick}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="text-sm">Search patients, surgeries...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded bg-background border border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-2 flex-1">
        <UpdateIndicator />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMode}
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {appVersion && (
          <span className="text-xs text-muted-foreground font-medium">v{appVersion}</span>
        )}
      </div>
    </header>
  )
}
