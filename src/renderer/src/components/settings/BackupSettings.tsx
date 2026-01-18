import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Save,
  FolderOpen,
  Trash2,
  Clock,
  HardDrive,
  Download,
  RotateCcw,
  Upload,
  Database,
  Zap,
  History,
  FileArchive
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
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
import { queries } from '@renderer/lib/queries'
import { useSettings } from '@renderer/contexts/SettingsContext'
import { unwrapResult, cn } from '@renderer/lib/utils'
import { BackupInfo } from 'src/shared/types/backup'
import { Skeleton } from '@renderer/components/ui/skeleton'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp.replace(/_/g, 'T').replace(/-(\d{2})-(\d{2})$/, ':$1:$2'))
    return date.toLocaleString()
  } catch {
    return timestamp
  }
}

export const BackupSettings = () => {
  const queryClient = useQueryClient()
  const { settings } = useSettings()

  const [backupEnabled, setBackupEnabled] = useState(true)
  const [backupFolder, setBackupFolder] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [backupToDelete, setBackupToDelete] = useState<BackupInfo | null>(null)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [backupToRestore, setBackupToRestore] = useState<BackupInfo | null>(null)
  const [externalRestoreDialogOpen, setExternalRestoreDialogOpen] = useState(false)
  const [externalFilePath, setExternalFilePath] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setBackupEnabled(settings['backup_enabled'] === 'true')
      setBackupFolder(settings['backup_folder'] || '')
    }
  }, [settings])

  const { data: backups, isLoading: isLoadingBackups } = useQuery({
    ...queries.backup.list
  })

  const lastBackupTime = settings?.['last_backup_time']

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      return unwrapResult(window.api.invoke('createBackup', 'manual'))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.backup.list)
      await queryClient.invalidateQueries(queries.app.settings)
      toast.success('Backup created successfully')
    },
    onError: (error: Error) => {
      toast.error(`Backup failed: ${error.message}`)
    }
  })

  const deleteBackupMutation = useMutation({
    mutationFn: async (filename: string) => {
      return unwrapResult(window.api.invoke('deleteBackup', filename))
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.backup.list)
      toast.success('Backup deleted')
      setDeleteDialogOpen(false)
      setBackupToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const restoreBackupMutation = useMutation({
    mutationFn: async (backupPath: string) => {
      return unwrapResult(window.api.invoke('restoreBackup', backupPath))
    },
    onSuccess: async () => {
      toast.success('Database restored successfully. Restarting app...')
      setRestoreDialogOpen(false)
      setBackupToRestore(null)
      setTimeout(() => {
        window.electronApi.restartApp()
      }, 1000)
    },
    onError: (error: Error) => {
      toast.error(`Restore failed: ${error.message}`)
    }
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: { key: string; value: string | null }[]) => {
      await window.api.invoke('updateSettings', data)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries(queries.app.settings)
      toast.success('Backup settings saved')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const handleDownloadBackup = async (backup: BackupInfo) => {
    try {
      const result = await window.electronApi.saveBackupAs(backup.path, backup.filename)
      if (result.canceled) {
        // User cancelled
      } else if (result.success) {
        toast.success('Backup downloaded successfully')
      } else {
        toast.error(`Failed to download backup: ${result.error}`)
      }
    } catch (error) {
      toast.error(
        `Failed to download backup: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  const handleSelectFolder = async () => {
    const folder = await window.electronApi.selectBackupFolder()
    if (folder) {
      setBackupFolder(folder)
    }
  }

  const handleSaveSettings = async () => {
    await updateSettingsMutation.mutateAsync([
      { key: 'backup_enabled', value: backupEnabled ? 'true' : 'false' },
      { key: 'backup_folder', value: backupFolder || null }
    ])
  }

  const handleDeleteBackup = (backup: BackupInfo) => {
    setBackupToDelete(backup)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (backupToDelete) {
      deleteBackupMutation.mutate(backupToDelete.filename)
    }
  }

  const handleRestoreBackup = (backup: BackupInfo) => {
    setBackupToRestore(backup)
    setRestoreDialogOpen(true)
  }

  const confirmRestore = () => {
    if (backupToRestore) {
      restoreBackupMutation.mutate(backupToRestore.path)
    }
  }

  const handleRestoreFromFile = async () => {
    const filePath = await window.electronApi.selectBackupFile()
    if (filePath) {
      setExternalFilePath(filePath)
      setExternalRestoreDialogOpen(true)
    }
  }

  const confirmExternalRestore = () => {
    if (externalFilePath) {
      restoreBackupMutation.mutate(externalFilePath)
      setExternalRestoreDialogOpen(false)
      setExternalFilePath(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Automatic Backups Card */}
      <Card className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up overflow-hidden">
        <CardHeader className="pb-4 pt-5 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="flex items-center gap-3 relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-500/20">
              <Database className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Automatic Backups</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure backup schedule and storage location
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-5">
          {/* Enable Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label
              htmlFor="backup-enabled"
              className="text-sm font-medium cursor-pointer"
            >
              Enable hourly automatic backups
            </Label>
            <Switch
              id="backup-enabled"
              checked={backupEnabled}
              onCheckedChange={setBackupEnabled}
            />
          </div>

          {/* Backup Folder */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <FolderOpen className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <label className="text-sm font-medium">Backup Folder</label>
            </div>
            <div className="flex gap-2">
              <Input
                value={backupFolder}
                onChange={(e) => setBackupFolder(e.target.value)}
                placeholder="Default: ~/.opnotes/backups/"
                className="flex-1 h-11"
              />
              <Button variant="outline" onClick={handleSelectFolder} className="h-11">
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Leave empty to use the default backup location
            </p>
          </div>

          {/* Save Button and Last Backup */}
          <div className="flex items-center justify-between pt-2">
            <Button
              onClick={handleSaveSettings}
              variant="gradient"
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={updateSettingsMutation.isPending}
              loadingText="Saving..."
            >
              Save Settings
            </Button>
            {lastBackupTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Last backup: {new Date(lastBackupTime).toLocaleString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card
        className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
        style={{ animationDelay: '50ms' }}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4">
            Create a backup instantly or restore from a file
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => createBackupMutation.mutate()}
              leftIcon={<HardDrive className="h-4 w-4" />}
              isLoading={createBackupMutation.isPending}
              loadingText="Creating..."
            >
              Backup Now
            </Button>
            <Button
              variant="outline"
              onClick={handleRestoreFromFile}
              leftIcon={<Upload className="h-4 w-4" />}
            >
              Restore from File
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Backups Card */}
      <Card
        className="bg-gradient-to-br from-card to-card/80 animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <History className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Recent Backups
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Up to 10 backups are kept. Older backups are automatically deleted.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoadingBackups ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : !backups || backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <FileArchive className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No backups found</p>
              <p className="text-xs text-muted-foreground">
                Click &quot;Backup Now&quot; to create one
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {backups.map((backup: BackupInfo, index: number) => (
                <div
                  key={backup.filename}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group animate-fade-in-up'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <Database className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono truncate">{backup.filename}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatTimestamp(backup.timestamp)}</span>
                      <span className="text-border">•</span>
                      <span>{formatBytes(backup.size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRestoreBackup(backup)}
                      title="Restore this backup"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownloadBackup(backup)}
                      title="Download backup"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteBackup(backup)}
                      title="Delete backup"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{backupToDelete?.filename}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                isLoading={deleteBackupMutation.isPending}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore &quot;{backupToRestore?.filename}&quot;? This will
              replace the current database with this backup. A safety backup of your current data
              will be created first. The app will restart after the restore.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={confirmRestore} isLoading={restoreBackupMutation.isPending}>
                Restore
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* External Restore Dialog */}
      <AlertDialog open={externalRestoreDialogOpen} onOpenChange={setExternalRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore from External File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore from this file? This will replace the current
              database with the selected backup. A safety backup of your current data will be
              created first. The app will restart after the restore.
              <br />
              <br />
              <span className="font-mono text-xs break-all">{externalFilePath}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={confirmExternalRestore} isLoading={restoreBackupMutation.isPending}>
                Restore
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
