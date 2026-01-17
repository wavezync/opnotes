import { useState } from 'react'
import { useUpdate } from '@renderer/contexts/UpdateContext'
import { Button } from '@renderer/components/ui/button'
import { Progress } from '@renderer/components/ui/progress'
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
import { Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
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

  if (status === 'idle' || status === 'not-available') {
    return null
  }

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking...</span>
      </div>
    )
  }

  if (status === 'available') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 relative">
            <Download className="h-3.5 w-3.5" />
            <span className="text-xs">Update</span>
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">Update Available</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Version {updateInfo?.version} is ready to download
              </p>
            </div>
            {updateInfo?.releaseName && (
              <p className="text-xs text-muted-foreground">{updateInfo.releaseName}</p>
            )}
            <Button size="sm" className="w-full" onClick={downloadUpdate}>
              <Download className="h-3.5 w-3.5 mr-2" />
              Download Update
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (status === 'downloading') {
    const percent = Math.round(progress?.percent || 0)
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="text-xs">{percent}%</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">Downloading Update</h4>
              <p className="text-xs text-muted-foreground mt-1">Version {updateInfo?.version}</p>
            </div>
            <div className="space-y-2">
              <Progress value={percent} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {formatBytes(progress?.transferred || 0)} / {formatBytes(progress?.total || 0)}
                </span>
                <span>{formatBytes(progress?.bytesPerSecond || 0)}/s</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (status === 'ready') {
    return (
      <>
        <Button
          variant="default"
          size="sm"
          className={cn('h-7 gap-1 px-2 animate-pulse')}
          onClick={() => setShowRestartDialog(true)}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="text-xs">Restart to Update</span>
        </Button>

        <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Install Update</AlertDialogTitle>
              <AlertDialogDescription>
                Version {updateInfo?.version} has been downloaded and is ready to install. The
                application will restart to complete the update.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Later</AlertDialogCancel>
              <AlertDialogAction onClick={installUpdate}>Restart Now</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  if (status === 'error') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-destructive hover:text-destructive"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="text-xs">Update Error</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm text-destructive">Update Failed</h4>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={dismissError}>
                Dismiss
              </Button>
              <Button size="sm" className="flex-1" onClick={checkForUpdates}>
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
