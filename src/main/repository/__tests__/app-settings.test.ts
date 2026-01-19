import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { Kysely } from 'kysely'
import { Database } from '../../../shared/types/db'
import { createMigratedTestDb, closeTestDb } from '../../../../tests/helpers/test-db'

// Mock the db module
vi.mock('../../db', async () => {
  const testDb = await import('../../../../tests/helpers/test-db')
  const db = await testDb.createMigratedTestDb()
  return { db }
})

// Mock electron-log
vi.mock('electron-log', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

// Import after mocks are set up
import * as settingsRepo from '../app-settings'

describe('App Settings Repository', () => {
  let testDb: Kysely<Database>

  beforeAll(async () => {
    testDb = await createMigratedTestDb()
  })

  afterAll(async () => {
    await closeTestDb(testDb)
  })

  describe('getAllSettings', () => {
    it('should return all settings ordered by key', async () => {
      const result = await settingsRepo.getAllSettings()

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)

      // Check that settings are sorted by key
      for (let i = 1; i < result.length; i++) {
        expect(result[i].key >= result[i - 1].key).toBe(true)
      }
    })

    it('should include default settings from migrations', async () => {
      const result = await settingsRepo.getAllSettings()

      // Check for expected default keys from migrations
      const keys = result.map((s) => s.key)
      expect(keys).toContain('hospital_name')
      expect(keys).toContain('unit_name')
      expect(keys).toContain('theme')
    })
  })

  describe('updateSetting', () => {
    it('should update an existing setting', async () => {
      const result = await settingsRepo.updateSetting('hospital_name', 'Test Hospital')

      expect(result).toBeDefined()
      expect(result!.key).toBe('hospital_name')
      expect(result!.value).toBe('Test Hospital')
    })

    it('should allow setting a null value', async () => {
      // First set a value
      await settingsRepo.updateSetting('hospital_name', 'Some Hospital')

      // Then set it to null
      const result = await settingsRepo.updateSetting('hospital_name', null)

      expect(result!.value).toBeNull()
    })

    it('should update the same setting multiple times', async () => {
      await settingsRepo.updateSetting('unit_name', 'Unit A')
      await settingsRepo.updateSetting('unit_name', 'Unit B')
      const result = await settingsRepo.updateSetting('unit_name', 'Unit C')

      expect(result!.value).toBe('Unit C')
    })
  })

  describe('updateSettings', () => {
    it('should update multiple settings at once', async () => {
      await settingsRepo.updateSettings([
        { key: 'hospital_name', value: 'Batch Hospital' },
        { key: 'unit_name', value: 'Batch Unit' },
        { key: 'theme', value: 'dark' }
      ])

      const allSettings = await settingsRepo.getAllSettings()
      const settingsMap = new Map(allSettings.map((s) => [s.key, s.value]))

      expect(settingsMap.get('hospital_name')).toBe('Batch Hospital')
      expect(settingsMap.get('unit_name')).toBe('Batch Unit')
      expect(settingsMap.get('theme')).toBe('dark')
    })

    it('should handle empty array', async () => {
      // Should not throw
      await expect(settingsRepo.updateSettings([])).resolves.not.toThrow()
    })

    it('should handle mixed null and non-null values', async () => {
      await settingsRepo.updateSettings([
        { key: 'hospital_name', value: 'Hospital Value' },
        { key: 'telephone', value: null }
      ])

      const allSettings = await settingsRepo.getAllSettings()
      const settingsMap = new Map(allSettings.map((s) => [s.key, s.value]))

      expect(settingsMap.get('hospital_name')).toBe('Hospital Value')
      expect(settingsMap.get('telephone')).toBeNull()
    })
  })
})
