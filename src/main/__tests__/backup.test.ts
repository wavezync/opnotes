import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock electron
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockReturnValue('/tmp/test-opnotes')
  }
}))

// Mock electron-log
vi.mock('electron-log', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Mock fs/promises
const mockMkdir = vi.fn().mockResolvedValue(undefined)
const mockCopyFile = vi.fn().mockResolvedValue(undefined)
const mockReaddir = vi.fn().mockResolvedValue([])
const mockStat = vi.fn()
const mockUnlink = vi.fn().mockResolvedValue(undefined)

vi.mock('fs/promises', () => ({
  mkdir: mockMkdir,
  copyFile: mockCopyFile,
  readdir: mockReaddir,
  stat: mockStat,
  unlink: mockUnlink
}))

// Mock the database
const mockExecuteTakeFirst = vi.fn()
const mockExecute = vi.fn()
const mockDb = {
  selectFrom: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  updateTable: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  executeTakeFirst: mockExecuteTakeFirst,
  execute: mockExecute
}

vi.mock('../db', () => ({
  db: mockDb,
  DB_PATH: '/tmp/test-opnotes/data.db'
}))

// Import after mocks
import * as backup from '../backup'

describe('Backup Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockExecuteTakeFirst.mockResolvedValue({ value: '/tmp/test-backups' })
  })

  afterEach(() => {
    backup.stopBackupScheduler()
  })

  describe('getBackupFolder', () => {
    it('should return configured backup folder', async () => {
      mockExecuteTakeFirst.mockResolvedValue({ value: '/custom/backup/path' })

      const folder = await backup.getBackupFolder()

      expect(folder).toBe('/custom/backup/path')
    })

    it('should return default folder when not configured', async () => {
      mockExecuteTakeFirst.mockResolvedValue(undefined)

      const folder = await backup.getBackupFolder()

      expect(folder).toBe('/tmp/test-opnotes/backups')
    })
  })

  describe('createBackup', () => {
    it('should create a backup successfully', async () => {
      mockExecuteTakeFirst.mockResolvedValue({ value: '/tmp/test-backups' })
      mockExecute.mockResolvedValue({ numAffectedRows: 1 })
      mockReaddir.mockResolvedValue([])

      const result = await backup.createBackup('manual')

      expect(result.success).toBe(true)
      expect(result.path).toContain('/tmp/test-backups/data_')
      expect(result.path).toContain('.db')
      expect(mockCopyFile).toHaveBeenCalled()
      expect(mockMkdir).toHaveBeenCalledWith('/tmp/test-backups', { recursive: true })
    })

    it('should return error on failure', async () => {
      mockExecuteTakeFirst.mockResolvedValue({ value: '/tmp/test-backups' })
      mockCopyFile.mockRejectedValueOnce(new Error('Copy failed'))

      const result = await backup.createBackup('manual')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Copy failed')
    })
  })

  describe('listBackups', () => {
    it('should return empty array when folder is empty', async () => {
      mockReaddir.mockResolvedValue([])

      const backups = await backup.listBackups()

      expect(backups).toEqual([])
    })

    it('should return empty array when folder does not exist', async () => {
      mockReaddir.mockRejectedValue(new Error('ENOENT'))

      const backups = await backup.listBackups()

      expect(backups).toEqual([])
    })

    it('should list backup files correctly', async () => {
      mockReaddir.mockResolvedValue([
        'data_2024-01-15_10-00-00.db',
        'data_2024-01-16_10-00-00.db',
        'other-file.txt'
      ])

      mockStat.mockImplementation(async (path: string) => {
        if (path.includes('2024-01-15')) {
          return { mtime: new Date('2024-01-15'), size: 1000 }
        }
        if (path.includes('2024-01-16')) {
          return { mtime: new Date('2024-01-16'), size: 2000 }
        }
        return { mtime: new Date(), size: 100 }
      })

      const backups = await backup.listBackups()

      expect(backups.length).toBe(2)
      // Should be sorted newest first
      expect(backups[0].filename).toBe('data_2024-01-16_10-00-00.db')
      expect(backups[1].filename).toBe('data_2024-01-15_10-00-00.db')
    })

    it('should ignore non-backup files', async () => {
      mockReaddir.mockResolvedValue([
        'data_2024-01-15_10-00-00.db',
        'readme.txt',
        'config.json',
        'backup_old.db' // Wrong prefix
      ])

      mockStat.mockResolvedValue({ mtime: new Date(), size: 1000 })

      const backups = await backup.listBackups()

      expect(backups.length).toBe(1)
      expect(backups[0].filename).toBe('data_2024-01-15_10-00-00.db')
    })
  })

  describe('deleteBackup', () => {
    it('should delete a valid backup file', async () => {
      const result = await backup.deleteBackup('data_2024-01-15_10-00-00.db')

      expect(result).toBe(true)
      expect(mockUnlink).toHaveBeenCalled()
    })

    it('should reject invalid filenames', async () => {
      const result1 = await backup.deleteBackup('invalid.db')
      expect(result1).toBe(false)

      const result2 = await backup.deleteBackup('../../../etc/passwd')
      expect(result2).toBe(false)

      const result3 = await backup.deleteBackup('data_2024-01-15.txt')
      expect(result3).toBe(false)

      expect(mockUnlink).not.toHaveBeenCalled()
    })

    it('should return false on delete error', async () => {
      mockUnlink.mockRejectedValueOnce(new Error('Delete failed'))

      const result = await backup.deleteBackup('data_2024-01-15_10-00-00.db')

      expect(result).toBe(false)
    })
  })

  describe('cleanupOldBackups', () => {
    it('should not delete backups when under limit', async () => {
      mockReaddir.mockResolvedValue([
        'data_2024-01-15_10-00-00.db',
        'data_2024-01-16_10-00-00.db'
      ])
      mockStat.mockResolvedValue({ mtime: new Date(), size: 1000 })

      await backup.cleanupOldBackups(10)

      expect(mockUnlink).not.toHaveBeenCalled()
    })

    it('should delete oldest backups when over limit', async () => {
      const files = []
      for (let i = 1; i <= 15; i++) {
        files.push(`data_2024-01-${String(i).padStart(2, '0')}_10-00-00.db`)
      }
      mockReaddir.mockResolvedValue(files)
      mockStat.mockImplementation(async (path: string) => {
        const match = path.match(/2024-01-(\d{2})/)
        const day = match ? parseInt(match[1]) : 1
        return {
          mtime: new Date(`2024-01-${String(day).padStart(2, '0')}`),
          size: 1000
        }
      })

      await backup.cleanupOldBackups(10)

      // Should delete 5 oldest backups
      expect(mockUnlink).toHaveBeenCalledTimes(5)
    })
  })

  describe('exportBackupToPath', () => {
    it('should export backup to specified path', async () => {
      const result = await backup.exportBackupToPath('/custom/export/backup.db')

      expect(result.success).toBe(true)
      expect(result.path).toBe('/custom/export/backup.db')
      expect(mockCopyFile).toHaveBeenCalledWith('/tmp/test-opnotes/data.db', '/custom/export/backup.db')
    })

    it('should return error on export failure', async () => {
      mockCopyFile.mockRejectedValueOnce(new Error('Export failed'))

      const result = await backup.exportBackupToPath('/invalid/path/backup.db')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Export failed')
    })
  })

  describe('restoreBackup', () => {
    it('should restore backup successfully', async () => {
      mockStat.mockResolvedValue({ size: 1000 })
      mockExecuteTakeFirst.mockResolvedValue({ value: '/tmp/test-backups' })

      const result = await backup.restoreBackup('/tmp/backup/data_backup.db')

      expect(result.success).toBe(true)
      expect(result.path).toBe('/tmp/test-opnotes/data.db')
      // Should create safety backup first, then restore
      expect(mockCopyFile).toHaveBeenCalledTimes(2)
    })

    it('should return error when backup file does not exist', async () => {
      mockStat.mockRejectedValue(new Error('ENOENT'))

      const result = await backup.restoreBackup('/nonexistent/backup.db')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Backup file does not exist')
    })

    it('should return error on restore failure', async () => {
      mockStat.mockResolvedValue({ size: 1000 })
      mockExecuteTakeFirst.mockResolvedValue({ value: '/tmp/test-backups' })
      // First copyFile succeeds (safety backup), second fails (restore)
      mockCopyFile
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Restore failed'))

      const result = await backup.restoreBackup('/tmp/backup.db')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Restore failed')
    })
  })

  describe('Backup Scheduler', () => {
    it('should not start when backups are disabled', async () => {
      mockExecuteTakeFirst.mockResolvedValue({ value: 'false' })

      await backup.initBackupScheduler()

      // Scheduler should not be running
      // The function should complete without scheduling
    })

    it('should stop scheduler when called', () => {
      // This should not throw
      backup.stopBackupScheduler()
    })

    it('should restart scheduler', async () => {
      mockExecuteTakeFirst
        .mockResolvedValueOnce({ value: 'false' }) // isBackupEnabled
        .mockResolvedValueOnce({ value: 'false' }) // isBackupEnabled (for restart)

      await backup.restartBackupScheduler()

      // Should stop and reinitialize
    })
  })
})
