import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { Kysely } from 'kysely'
import { Database } from '../../../shared/types/db'
import { createMigratedTestDb, cleanupTestDb, closeTestDb } from '../../../../tests/helpers/test-db'

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
import * as activityRepo from '../activity'

describe('Activity Repository', () => {
  let testDb: Kysely<Database>

  beforeAll(async () => {
    testDb = await createMigratedTestDb()
  })

  afterAll(async () => {
    await closeTestDb(testDb)
  })

  beforeEach(async () => {
    await cleanupTestDb(testDb)
  })

  describe('logActivity', () => {
    it('should log a patient activity', async () => {
      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 1,
        action: 'created',
        title: 'Patient Created',
        description: 'New patient John Doe created',
        patientId: 1
      })

      const activities = await activityRepo.getRecentActivities(10)

      expect(activities.length).toBe(1)
      expect(activities[0].entityType).toBe('patient')
      expect(activities[0].action).toBe('created')
      expect(activities[0].title).toBe('Patient Created')
    })

    it('should log a surgery activity', async () => {
      await activityRepo.logActivity({
        entityType: 'surgery',
        entityId: 5,
        action: 'updated',
        title: 'Surgery Updated',
        description: 'Surgery details modified',
        patientId: 1,
        surgeryId: 5
      })

      const activities = await activityRepo.getRecentActivities(10)

      expect(activities.length).toBe(1)
      expect(activities[0].entityType).toBe('surgery')
      expect(activities[0].surgeryId).toBe(5)
    })

    it('should log a followup activity', async () => {
      await activityRepo.logActivity({
        entityType: 'followup',
        entityId: 10,
        action: 'created',
        title: 'Followup Added',
        description: 'New followup note added',
        patientId: 1,
        surgeryId: 5
      })

      const activities = await activityRepo.getRecentActivities(10)

      expect(activities[0].entityType).toBe('followup')
    })
  })

  describe('getRecentActivities', () => {
    it('should return empty array when no activities exist', async () => {
      const activities = await activityRepo.getRecentActivities(10)
      expect(activities).toEqual([])
    })

    it('should respect the limit parameter', async () => {
      // Log multiple activities
      for (let i = 1; i <= 10; i++) {
        await activityRepo.logActivity({
          entityType: 'patient',
          entityId: i,
          action: 'created',
          title: `Activity ${i}`,
          description: `Description ${i}`,
          patientId: i
        })
      }

      const activities = await activityRepo.getRecentActivities(5)

      expect(activities.length).toBe(5)
    })

    it('should return activities in reverse chronological order', async () => {
      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 1,
        action: 'created',
        title: 'First',
        description: 'First activity',
        patientId: 1
      })

      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10))

      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 2,
        action: 'created',
        title: 'Second',
        description: 'Second activity',
        patientId: 2
      })

      const activities = await activityRepo.getRecentActivities(10)

      expect(activities[0].title).toBe('Second')
      expect(activities[1].title).toBe('First')
    })
  })

  describe('getActivitiesForEntity', () => {
    it('should return activities for a specific entity', async () => {
      // Log activities for different entities
      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 1,
        action: 'created',
        title: 'Patient 1 Created',
        description: 'Patient 1',
        patientId: 1
      })

      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 2,
        action: 'created',
        title: 'Patient 2 Created',
        description: 'Patient 2',
        patientId: 2
      })

      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 1,
        action: 'updated',
        title: 'Patient 1 Updated',
        description: 'Patient 1 update',
        patientId: 1
      })

      const activities = await activityRepo.getActivitiesForEntity('patient', 1)

      expect(activities.length).toBe(2)
      expect(activities.every((a) => a.entityId === 1)).toBe(true)
    })

    it('should filter by entity type and id', async () => {
      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 1,
        action: 'created',
        title: 'Patient Activity',
        description: 'Patient',
        patientId: 1
      })

      await activityRepo.logActivity({
        entityType: 'surgery',
        entityId: 1,
        action: 'created',
        title: 'Surgery Activity',
        description: 'Surgery',
        patientId: 1,
        surgeryId: 1
      })

      const patientActivities = await activityRepo.getActivitiesForEntity('patient', 1)
      const surgeryActivities = await activityRepo.getActivitiesForEntity('surgery', 1)

      expect(patientActivities.length).toBe(1)
      expect(patientActivities[0].title).toBe('Patient Activity')

      expect(surgeryActivities.length).toBe(1)
      expect(surgeryActivities[0].title).toBe('Surgery Activity')
    })
  })

  describe('listActivityLog', () => {
    beforeEach(async () => {
      // Set up test data
      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 1,
        action: 'created',
        title: 'Patient Created',
        description: 'New patient',
        patientId: 1
      })

      await activityRepo.logActivity({
        entityType: 'surgery',
        entityId: 1,
        action: 'created',
        title: 'Surgery Created',
        description: 'New surgery',
        patientId: 1,
        surgeryId: 1
      })

      await activityRepo.logActivity({
        entityType: 'patient',
        entityId: 1,
        action: 'updated',
        title: 'Patient Updated',
        description: 'Patient modified',
        patientId: 1
      })
    })

    it('should return all activities without filter', async () => {
      const result = await activityRepo.listActivityLog({})

      expect(result.data.length).toBe(3)
      expect(result.total).toBe(3)
    })

    it('should filter by entity type', async () => {
      const result = await activityRepo.listActivityLog({ entityType: 'patient' })

      expect(result.data.length).toBe(2)
      expect(result.data.every((a) => a.entityType === 'patient')).toBe(true)
    })

    it('should filter by action', async () => {
      const result = await activityRepo.listActivityLog({ action: 'created' })

      expect(result.data.length).toBe(2)
      expect(result.data.every((a) => a.action === 'created')).toBe(true)
    })

    it('should filter by search term', async () => {
      const result = await activityRepo.listActivityLog({ search: 'surgery' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].title).toBe('Surgery Created')
    })

    it('should support pagination', async () => {
      const result = await activityRepo.listActivityLog({ page: 1, pageSize: 2 })

      expect(result.data.length).toBe(2)
      expect(result.total).toBe(3)
    })
  })
})
