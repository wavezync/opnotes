import { useTheme } from '@renderer/contexts/ThemeContext'
import { cn } from '@renderer/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@renderer/components/ui/tooltip'

/**
 * Animated sun/moon mode toggle with smooth transitions
 * Features orbital animation and morphing icons
 */
export function ModeToggle() {
  const { theme, toggleMode } = useTheme()
  const isDark = theme.mode === 'dark'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleMode}
            className={cn(
              'relative h-9 w-9 rounded-lg overflow-hidden',
              'transition-all duration-500 ease-out',
              'hover:bg-accent/50 active:scale-95',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {/* Background glow effect */}
            <div
              className={cn(
                'absolute inset-0 transition-all duration-500',
                isDark
                  ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent'
                  : 'bg-gradient-to-br from-amber-400/20 via-orange-300/10 to-transparent'
              )}
            />

            {/* Sun/Moon container */}
            <div className="relative h-full w-full flex items-center justify-center">
              {/* Sun */}
              <div
                className={cn(
                  'absolute transition-all duration-500 ease-out',
                  isDark
                    ? 'opacity-0 rotate-90 scale-0'
                    : 'opacity-100 rotate-0 scale-100'
                )}
              >
                {/* Sun core */}
                <div className="relative">
                  <div className="h-4 w-4 rounded-full bg-amber-500" />
                  {/* Sun rays */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 h-[2px] w-1 bg-amber-500 origin-left"
                      style={{
                        transform: `rotate(${i * 45}deg) translateX(8px) translateY(-1px)`
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Moon */}
              <div
                className={cn(
                  'absolute transition-all duration-500 ease-out',
                  isDark
                    ? 'opacity-100 rotate-0 scale-100'
                    : 'opacity-0 -rotate-90 scale-0'
                )}
              >
                <div className="relative">
                  {/* Moon body */}
                  <div className="h-4 w-4 rounded-full bg-slate-200" />
                  {/* Moon shadow (crescent effect) */}
                  <div
                    className="absolute top-0 -right-0.5 h-3 w-3 rounded-full bg-background"
                    style={{ transform: 'translate(25%, 10%)' }}
                  />
                  {/* Stars */}
                  <div className="absolute -top-1 -right-2 h-1 w-1 rounded-full bg-slate-300 animate-pulse" />
                  <div
                    className="absolute top-2 -right-2.5 h-0.5 w-0.5 rounded-full bg-slate-400 animate-pulse"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              </div>
            </div>

            {/* Orbital ring on hover */}
            <div
              className={cn(
                'absolute inset-0.5 rounded-lg border-2 border-dashed opacity-0',
                'transition-opacity duration-300',
                'group-hover:opacity-30',
                isDark ? 'border-purple-400' : 'border-amber-400'
              )}
              style={{
                animation: 'spin 8s linear infinite'
              }}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>Switch to {isDark ? 'light' : 'dark'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
