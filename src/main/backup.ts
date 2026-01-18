import { app } from 'electron'
import { join } from 'path'
import { copyFile, mkdir, readdir, stat, unlink } from 'fs/promises'
import log from 'electron-log'
import { DB_PATH, db } from './db'
import { BackupFrequency, BackupInfo, BackupReason, BackupResult } from '../shared/types/backup'

const DEFAULT_BACKUP_FOLDER = join(app.getPath('userData'), 'backups')
const MAX_BACKUPS = 10
const HOURLY_MS = 60 * 60 * 1000

let schedulerTimeout: NodeJS.Timeout | null = null

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`
}

export async function getBackupFolder(): Promise<string> {
  const result = await db
    .selectFrom('app_settings')
    .select('value')
    .where('key', '=', 'backup_folder')
    .executeTakeFirst()

  return result?.value || DEFAULT_BACKUP_FOLDER
}

async function ensureBackupFolder(): Promise<string> {
  const folder = await getBackupFolder()
  await mkdir(folder, { recursive: true })
  return folder
}

async function updateLastBackupTime(): Promise<void> {
  const now = new Date().toISOString()
  await db
    .updateTable('app_settings')
    .set({ value: now })
    .where('key', '=', 'last_backup_time')
    .execute()
}

export async function createBackup(reason: BackupReason): Promise<BackupResult> {
  try {
    log.info(`Creating backup (reason: ${reason})`)
    const folder = await ensureBackupFolder()
    const timestamp = formatDate(new Date())
    const filename = `data_${timestamp}.db`
    const backupPath = join(folder, filename)

    await copyFile(DB_PATH, backupPath)
    await updateLastBackupTime()

    log.info(`Backup created: ${backupPath}`)

    // Cleanup old backups after creating a new one
    await cleanupOldBackups()

    return { success: true, path: backupPath }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    log.error('Backup failed:', error)
    return { success: false, error: errorMessage }
  }
}

export async function listBackups(): Promise<BackupInfo[]> {
  try {
    const folder = await getBackupFolder()

    let files: string[]
    try {
      files = await readdir(folder)
    } catch {
      // Folder doesn't exist yet
      return []
    }

    const backups: BackupInfo[] = []

    for (const file of files) {
      if (!file.endsWith('.db') || !file.startsWith('data_')) {
        continue
      }

      const filePath = join(folder, file)
      const fileStat = await stat(filePath)

      // Extract timestamp from filename (data_YYYY-MM-DD_HH-mm-ss.db)
      const match = file.match(/data_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.db/)
      const timestamp = match
        ? match[1].replace(/_/g, 'T').replace(/-(\d{2})-(\d{2})$/, ':$1:$2')
        : fileStat.mtime.toISOString()

      backups.push({
        filename: file,
        path: filePath,
        timestamp,
        size: fileStat.size
      })
    }

    // Sort by timestamp descending (newest first)
    backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp))

    return backups
  } catch (error) {
    log.error('Error listing backups:', error)
    return []
  }
}

export async function deleteBackup(filename: string): Promise<boolean> {
  try {
    const folder = await getBackupFolder()
    const filePath = join(folder, filename)

    // Security check: ensure filename is valid
    if (!filename.startsWith('data_') || !filename.endsWith('.db')) {
      log.error('Invalid backup filename:', filename)
      return false
    }

    await unlink(filePath)
    log.info(`Deleted backup: ${filePath}`)
    return true
  } catch (error) {
    log.error('Error deleting backup:', error)
    return false
  }
}

export async function cleanupOldBackups(maxToKeep: number = MAX_BACKUPS): Promise<void> {
  try {
    const backups = await listBackups()

    if (backups.length <= maxToKeep) {
      log.info(`Backup cleanup: ${backups.length} backups, keeping all (max: ${maxToKeep})`)
      return
    }

    // Delete backups beyond the max limit (list is already sorted newest first)
    const toDelete = backups.slice(maxToKeep)
    log.info(`Backup cleanup: Found ${backups.length} backups, deleting ${toDelete.length} oldest`)

    for (const backup of toDelete) {
      try {
        await unlink(backup.path)
        log.info(`Deleted old backup: ${backup.filename}`)
      } catch (error) {
        log.warn(`Failed to delete backup ${backup.filename}: ${error}`)
      }
    }
  } catch (error) {
    log.error('Error cleaning up old backups:', error)
  }
}

async function isBackupEnabled(): Promise<boolean> {
  const result = await db
    .selectFrom('app_settings')
    .select('value')
    .where('key', '=', 'backup_enabled')
    .executeTakeFirst()

  return result?.value === 'true'
}

async function getLastBackupTime(): Promise<Date | null> {
  const result = await db
    .selectFrom('app_settings')
    .select('value')
    .where('key', '=', 'last_backup_time')
    .executeTakeFirst()

  return result?.value ? new Date(result.value) : null
}

async function getBackupFrequency(): Promise<BackupFrequency> {
  const result = await db
    .selectFrom('app_settings')
    .select('value')
    .where('key', '=', 'backup_frequency')
    .executeTakeFirst()

  return (result?.value as BackupFrequency) || 'daily'
}

async function getBackupTime(): Promise<string> {
  const result = await db
    .selectFrom('app_settings')
    .select('value')
    .where('key', '=', 'backup_time')
    .executeTakeFirst()

  return result?.value || '08:00'
}

function getNextScheduledTime(frequency: BackupFrequency, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const now = new Date()
  const next = new Date()

  next.setHours(hours, minutes, 0, 0)

  if (frequency === 'hourly') {
    // For hourly, just return next hour
    next.setMinutes(0, 0, 0)
    if (next <= now) {
      next.setHours(next.getHours() + 1)
    }
  } else if (frequency === 'daily') {
    // Run at specified time daily
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }
  } else if (frequency === 'weekly') {
    // Run on Monday at specified time
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ...
    const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek
    next.setDate(now.getDate() + daysUntilMonday)
    // If it's Monday but past the time, schedule for next Monday
    if (next <= now) {
      next.setDate(next.getDate() + 7)
    }
  }

  return next
}

export async function initBackupScheduler(): Promise<void> {
  const enabled = await isBackupEnabled()
  if (!enabled) {
    log.info('Backup scheduler not started: backups are disabled')
    return
  }

  const frequency = await getBackupFrequency()
  const backupTime = await getBackupTime()
  const lastBackup = await getLastBackupTime()
  const now = new Date()

  let delay: number

  if (frequency === 'hourly') {
    // For hourly, use the old logic
    if (lastBackup) {
      const timeSinceLast = now.getTime() - lastBackup.getTime()
      if (timeSinceLast >= HOURLY_MS) {
        delay = 0
      } else {
        delay = HOURLY_MS - timeSinceLast
      }
    } else {
      delay = 0
    }
    log.info(`Backup scheduler starting (hourly). First backup in ${Math.round(delay / 1000)}s`)
    scheduleNextBackup(delay, frequency, backupTime)
  } else {
    // For daily/weekly, calculate next scheduled time
    const nextRun = getNextScheduledTime(frequency, backupTime)
    delay = nextRun.getTime() - now.getTime()

    // If no backup has ever been done, or last backup is older than the interval, run immediately
    const intervalMs = frequency === 'daily' ? 24 * HOURLY_MS : 7 * 24 * HOURLY_MS
    if (!lastBackup || now.getTime() - lastBackup.getTime() >= intervalMs) {
      delay = 0
      log.info(`Backup scheduler starting (${frequency}). Running backup immediately (overdue)`)
    } else {
      log.info(
        `Backup scheduler starting (${frequency} at ${backupTime}). Next backup: ${nextRun.toLocaleString()}`
      )
    }
    scheduleNextBackup(delay, frequency, backupTime)
  }
}

function scheduleNextBackup(delay: number, frequency: BackupFrequency, backupTime: string): void {
  schedulerTimeout = setTimeout(async () => {
    await runScheduledBackup()

    // Schedule next backup based on frequency
    let nextDelay: number
    if (frequency === 'hourly') {
      nextDelay = HOURLY_MS
    } else {
      const nextRun = getNextScheduledTime(frequency, backupTime)
      nextDelay = nextRun.getTime() - Date.now()
      log.info(`Next ${frequency} backup scheduled for: ${nextRun.toLocaleString()}`)
    }
    scheduleNextBackup(nextDelay, frequency, backupTime)
  }, delay)
}

async function runScheduledBackup(): Promise<void> {
  const enabled = await isBackupEnabled()
  if (!enabled) {
    log.info('Skipping scheduled backup: backups are disabled')
    return
  }

  log.info('Running scheduled backup')
  await createBackup('scheduled')
}

export function stopBackupScheduler(): void {
  if (schedulerTimeout) {
    clearTimeout(schedulerTimeout)
    schedulerTimeout = null
    log.info('Backup scheduler stopped')
  }
}

export async function restartBackupScheduler(): Promise<void> {
  stopBackupScheduler()
  await initBackupScheduler()
}

export async function exportBackupToPath(destinationPath: string): Promise<BackupResult> {
  try {
    log.info(`Exporting backup to: ${destinationPath}`)
    await copyFile(DB_PATH, destinationPath)
    log.info(`Backup exported successfully: ${destinationPath}`)
    return { success: true, path: destinationPath }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    log.error('Export backup failed:', error)
    return { success: false, error: errorMessage }
  }
}

export async function restoreBackup(backupPath: string): Promise<BackupResult> {
  try {
    log.info(`Restoring backup from: ${backupPath}`)

    // 1. Validate backup file exists
    try {
      await stat(backupPath)
    } catch {
      return { success: false, error: 'Backup file does not exist' }
    }

    // 2. Create safety backup of current DB before restore
    const folder = await ensureBackupFolder()
    const timestamp = formatDate(new Date())
    const safetyFilename = `data_pre_restore_${timestamp}.db`
    const safetyPath = join(folder, safetyFilename)

    await copyFile(DB_PATH, safetyPath)
    log.info(`Safety backup created: ${safetyPath}`)

    // 3. Copy backup file to DB_PATH (overwrite)
    await copyFile(backupPath, DB_PATH)
    log.info(`Database restored from: ${backupPath}`)

    return { success: true, path: DB_PATH }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    log.error('Restore backup failed:', error)
    return { success: false, error: errorMessage }
  }
}
