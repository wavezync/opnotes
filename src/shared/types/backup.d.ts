export type BackupReason = 'manual' | 'scheduled' | 'pre-update'

export interface BackupInfo {
  filename: string
  path: string
  timestamp: string
  size: number
}

export interface BackupResult {
  success: boolean
  path?: string
  error?: string
}

export interface BackupSettings {
  backup_enabled: boolean
  backup_folder: string | null
  last_backup_time: string | null
}
