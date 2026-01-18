import { useState, useEffect } from 'react'
import { useUpdate } from '@renderer/contexts/UpdateContext'
import { Button } from '@renderer/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@renderer/components/ui/alert-dialog'
import { Download, Loader2, AlertCircle, RefreshCw, Sparkles, ArrowDownToLine } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function UpdateIndicator() {
  const {
    status,
    updateInfo,
    progress,
    error,
    downloadUpdate,
    installUpdate,
    checkForUpdates,
    dismissError
  } = useUpdate()
  const [showRestartDialog, setShowRestartDialog] = useState(false)
  const [animatedPercent, setAnimatedPercent] = useState(0)

  // Animate progress smoothly
  useEffect(() => {
    if (status === 'downloading' && progress?.percent) {
      const target = Math.round(progress.percent)
      const step = () => {
        setAnimatedPercent((prev) => {
          if (prev < target) return Math.min(prev + 1, target)
          if (prev > target) return Math.max(prev - 1, target)
          return prev
        })
      }
      const interval = setInterval(step, 20)
      return () => clearInterval(interval)
    }
  }, [status, progress?.percent])

  if (status === 'idle' || status === 'not-available') {
    return null
  }

  // Checking state - subtle pulsing indicator
  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Checking for updates...</span>
      </div>
    )
  }

  // Update available - eye-catching but refined
  if (status === 'available') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'relative h-8 gap-2 px-3 rounded-full',
              'bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10',
              'border border-primary/20 hover:border-primary/40',
              'text-primary hover:text-primary',
              'transition-all duration-300 hover:shadow-theme-primary',
              'group overflow-hidden'
            )}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            {/* Notification dot with pulse */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>

            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Update Available</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
          {/* Header with gradient */}
          <div className="relative p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <h4 className="font-semibold text-sm">New Version Available</h4>
              </div>
              <p className="text-xs text-muted-foreground">
                Version <span className="font-mono font-medium text-foreground">{updateInfo?.version}</span> is ready
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {updateInfo?.releaseName && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                <ArrowDownToLine className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">{updateInfo.releaseName}</p>
              </div>
            )}

            <Button
              size="sm"
              className={cn(
                'w-full h-9 gap-2 font-semibold',
                'bg-gradient-primary shadow-theme-primary',
                'hover:opacity-90 transition-opacity'
              )}
              onClick={downloadUpdate}
            >
              <Download className="h-4 w-4" />
              Download Update
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Downloading - animated progress with refined styling
  if (status === 'downloading') {
    const percent = animatedPercent
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'relative h-8 gap-2 px-3 rounded-full overflow-hidden',
              'bg-muted/50 border border-border/50',
              'hover:bg-muted hover:border-border',
              'transition-all duration-200'
            )}
          >
            {/* Progress fill background */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/15 to-primary/10 transition-transform duration-300 ease-out origin-left"
              style={{ transform: `scaleX(${percent / 100})` }}
            />

            <div className="relative flex items-center gap-2">
              <div className="relative">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              </div>
              <span className="text-xs font-semibold tabular-nums">{percent}%</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
          {/* Header */}
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                <Loader2 className="h-4 w-4 animate-spin text-primary relative" />
              </div>
              <h4 className="font-semibold text-sm">Downloading Update</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Version <span className="font-mono font-medium text-foreground">{updateInfo?.version}</span>
            </p>
          </div>

          {/* Progress section */}
          <div className="p-4 space-y-4">
            {/* Custom progress bar */}
            <div className="space-y-2">
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                {/* Animated gradient fill */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/80 transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${percent}%` }}
                >
                  {/* Shimmer effect on progress */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>

              {/* Stats row */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="font-mono tabular-nums">{formatBytes(progress?.transferred || 0)}</span>
                  <span className="text-border">/</span>
                  <span className="font-mono tabular-nums">{formatBytes(progress?.total || 0)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <ArrowDownToLine className="h-3 w-3" />
                  <span className="font-mono tabular-nums">{formatBytes(progress?.bytesPerSecond || 0)}/s</span>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Ready to install - prominent call to action
  if (status === 'ready') {
    return (
      <>
        <Button
          size="sm"
          className={cn(
            'relative h-8 gap-2 px-4 rounded-full overflow-hidden',
            'bg-gradient-primary text-primary-foreground',
            'shadow-theme-primary hover:shadow-lg',
            'transition-all duration-300',
            'group'
          )}
          onClick={() => setShowRestartDialog(true)}
        >
          {/* Animated background pulse */}
          <div className="absolute inset-0 bg-white/10 animate-pulse-soft" />

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

          <RefreshCw className="h-3.5 w-3.5 relative" />
          <span className="text-xs font-semibold relative">Restart to Update</span>

          {/* Attention indicator */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white/50 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
          </span>
        </Button>

        <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-gradient-primary shadow-theme-primary">
                  <RefreshCw className="h-5 w-5 text-primary-foreground" />
                </div>
                <AlertDialogTitle className="text-lg">Ready to Update</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-sm leading-relaxed">
                Version <span className="font-mono font-medium text-foreground">{updateInfo?.version}</span> has been
                downloaded and is ready to install. The application will restart to complete the update.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel className="rounded-lg">Later</AlertDialogCancel>
              <AlertDialogAction
                onClick={installUpdate}
                className="rounded-lg bg-gradient-primary shadow-theme-primary hover:opacity-90"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Restart Now
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'relative h-8 gap-2 px-3 rounded-full',
              'bg-destructive/10 border border-destructive/20',
              'text-destructive hover:text-destructive',
              'hover:bg-destructive/15 hover:border-destructive/30',
              'transition-all duration-200'
            )}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">Update Error</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
          {/* Error header */}
          <div className="p-4 bg-destructive/5 border-b border-destructive/10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <h4 className="font-semibold text-sm text-destructive">Update Failed</h4>
            </div>
          </div>

          {/* Error details and actions */}
          <div className="p-4 space-y-4">
            <div className="p-2.5 rounded-lg bg-muted/50 border border-border/30">
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-9 rounded-lg"
                onClick={dismissError}
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                className="flex-1 h-9 rounded-lg"
                onClick={checkForUpdates}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Retry
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return null
}
