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
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@renderer/components/ui/table'
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
import { unwrapResult } from '@renderer/lib/utils'
import { BackupInfo } from 'src/shared/types/backup'

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
      // Wait a moment for the toast to be visible, then restart
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
        // User cancelled, do nothing
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
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Backup</h2>

      {/* Automatic Backups Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Automatic Backups</h3>
          <p className="text-sm text-muted-foreground">
            Configure automatic backup schedule and storage location
          </p>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="backup-enabled"
              checked={backupEnabled}
              onChange={(e) => setBackupEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="backup-enabled" className="cursor-pointer">
              Enable hourly automatic backups
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Backup Folder</Label>
            <div className="flex gap-2">
              <Input
                value={backupFolder}
                onChange={(e) => setBackupFolder(e.target.value)}
                placeholder="Default: ~/.opnotes/backups/"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSelectFolder}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Leave empty to use the default backup location
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              onClick={handleSaveSettings}
              leftIcon={<Save className="h-4 w-4" />}
              isLoading={updateSettingsMutation.isPending}
              loadingText="Saving..."
            >
              Save Settings
            </Button>
            {lastBackupTime && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last backup: {new Date(lastBackupTime).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Create a backup or restore from a file</p>
        </div>

        <div className="rounded-lg border p-4">
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
        </div>
      </div>

      {/* Recent Backups Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Recent Backups</h3>
          <p className="text-sm text-muted-foreground">
            Up to 10 backups are kept. Older backups are automatically deleted.
          </p>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingBackups ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !backups || backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No backups found. Click &quot;Backup Now&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup: BackupInfo) => (
                  <TableRow key={backup.filename}>
                    <TableCell className="font-mono text-sm">{backup.filename}</TableCell>
                    <TableCell>{formatTimestamp(backup.timestamp)}</TableCell>
                    <TableCell>{formatBytes(backup.size)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestoreBackup(backup)}
                          title="Restore this backup"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadBackup(backup)}
                          title="Download backup"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBackup(backup)}
                          title="Delete backup"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
