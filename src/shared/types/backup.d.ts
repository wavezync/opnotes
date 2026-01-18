export type BackupReason = 'manual' | 'scheduled' | 'pre-update'

export type BackupFrequency = 'hourly' | 'daily' | 'weekly'

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
  backup_frequency: BackupFrequency
  backup_time: string // HH:mm format
  last_backup_time: string | null
}
