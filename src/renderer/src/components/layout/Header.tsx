import { Search } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { UpdateIndicator } from '@renderer/components/update/UpdateIndicator'
import { ThemeDropdown } from '@renderer/components/theme/ThemeDropdown'
import { ModeToggle } from '@renderer/components/theme/ModeToggle'
import { modKey } from '@renderer/lib/platform'

interface HeaderProps {
  onSearchClick?: () => void
}

export function Header({ onSearchClick }: HeaderProps) {
  const { settings } = useSettings()

  const hospitalName = settings?.['hospital'] || ''
  const unitName = settings?.['unit'] || ''

  return (
    <header className="relative flex h-14 items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      {/* Gradient border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

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
        className="w-72 h-9 justify-start text-muted-foreground bg-muted/30 border-border/50 hover:bg-muted hover:border-border focus:ring-2 focus:ring-primary/20 mx-4 transition-all duration-200"
        onClick={onSearchClick}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="text-sm">Search patients, surgeries...</span>
        <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded bg-background border border-border px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">{modKey}</span>K
        </kbd>
      </Button>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-1 flex-1">
        <UpdateIndicator />

        {/* Theme dropdown for switching themes */}
        <ThemeDropdown />

        {/* Animated light/dark toggle */}
        <ModeToggle />
      </div>
    </header>
  )
}
