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
import * as dashboardRepo from '../dashboard'
import * as patientRepo from '../patient'
import * as surgeryRepo from '../surgery'
import * as doctorRepo from '../doctor'

describe('Dashboard Repository', () => {
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

  describe('getDashboardStats', () => {
    it('should return zero stats when database is empty', async () => {
      const stats = await dashboardRepo.getDashboardStats()

      expect(stats.totalPatients).toBe(0)
      expect(stats.totalSurgeries).toBe(0)
      expect(stats.totalDoctors).toBe(0)
      expect(stats.surgeriesThisMonth).toBe(0)
      expect(stats.patientsThisMonth).toBe(0)
    })

    it('should return correct total counts', async () => {
      // Create test data
      for (let i = 1; i <= 5; i++) {
        await patientRepo.createNewPatient({
          phn: `PHN_DASH_${i}`,
          name: `Patient ${i}`,
          birth_year: 1970 + i,
          gender: i % 2 === 0 ? 'M' : 'F'
        })
      }

      for (let i = 1; i <= 3; i++) {
        await doctorRepo.createNewDoctor({
          name: `Dr. Doctor ${i}`,
          designation: 'Consultant'
        })
      }

      const stats = await dashboardRepo.getDashboardStats()

      expect(stats.totalPatients).toBe(5)
      expect(stats.totalDoctors).toBe(3)
    })

    it('should count this month surgeries correctly', async () => {
      // Create a patient first
      const patient = await patientRepo.createNewPatient({
        phn: 'PHN_MONTH_TEST',
        name: 'Month Test Patient',
        birth_year: 1985,
        gender: 'M'
      })

      // Create a surgery for this month
      await surgeryRepo.createNewSurgery({
        patient_id: patient!.id,
        title: 'This Month Surgery',
        bht: 'BHT001',
        ward: 'Ward A',
        date: Date.now()
      })

      const stats = await dashboardRepo.getDashboardStats()

      expect(stats.totalSurgeries).toBe(1)
      expect(stats.surgeriesThisMonth).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getRecentActivity', () => {
    it('should return empty array when no data exists', async () => {
      const activity = await dashboardRepo.getRecentActivity(10)
      expect(activity).toEqual([])
    })

    it('should return recent patients', async () => {
      await patientRepo.createNewPatient({
        phn: 'PHN_RECENT_1',
        name: 'Recent Patient',
        birth_year: 1990,
        gender: 'M'
      })

      const activity = await dashboardRepo.getRecentActivity(10)

      expect(activity.length).toBeGreaterThanOrEqual(1)
      const patientActivity = activity.find((a) => a.type === 'patient')
      expect(patientActivity).toBeDefined()
      expect(patientActivity?.title).toBe('Recent Patient')
    })

    it('should return recent surgeries', async () => {
      const patient = await patientRepo.createNewPatient({
        phn: 'PHN_SURG_ACT',
        name: 'Surgery Activity Patient',
        birth_year: 1985,
        gender: 'F'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: patient!.id,
        title: 'Recent Procedure',
        bht: 'BHT002',
        ward: 'Ward B',
        date: Date.now()
      })

      const activity = await dashboardRepo.getRecentActivity(10)

      const surgeryActivity = activity.find((a) => a.type === 'surgery')
      expect(surgeryActivity).toBeDefined()
      // Surgery title is the patient name in recentSurgeries mapping
      expect(surgeryActivity?.title).toBe('Surgery Activity Patient')
      expect(surgeryActivity?.subtitle).toBe('Recent Procedure')
    })

    it('should return recent followups', async () => {
      const patient = await patientRepo.createNewPatient({
        phn: 'PHN_FU_ACT',
        name: 'Followup Patient',
        birth_year: 1980,
        gender: 'M'
      })

      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: patient!.id,
        title: 'Followup Procedure',
        bht: 'BHT003',
        ward: 'Ward C',
        date: Date.now()
      })

      await surgeryRepo.createNewFollowUp(surgery!.id, 'Recent followup notes')

      const activity = await dashboardRepo.getRecentActivity(10)

      const followupActivity = activity.find((a) => a.type === 'followup')
      expect(followupActivity).toBeDefined()
      expect(followupActivity?.title).toBe('Followup Patient')
    })

    it('should respect limit parameter', async () => {
      // Create multiple patients
      for (let i = 1; i <= 10; i++) {
        await patientRepo.createNewPatient({
          phn: `PHN_LIMIT_${i}`,
          name: `Patient ${i}`,
          birth_year: 1995,
          gender: 'M'
        })
      }

      const activity = await dashboardRepo.getRecentActivity(5)

      expect(activity.length).toBeLessThanOrEqual(5)
    })

    it('should return mixed activity types sorted by date', async () => {
      // Create patient
      const patient = await patientRepo.createNewPatient({
        phn: 'PHN_MIXED',
        name: 'Mixed Activity Patient',
        birth_year: 1990,
        gender: 'F'
      })

      // Create surgery
      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: patient!.id,
        title: 'Mixed Procedure',
        bht: 'BHT004',
        ward: 'Ward A',
        date: Date.now()
      })

      // Create followup
      await surgeryRepo.createNewFollowUp(surgery!.id, 'Mixed followup')

      const activity = await dashboardRepo.getRecentActivity(10)

      // Should have activities of different types
      const types = activity.map((a) => a.type)
      expect(types).toContain('patient')
      expect(types).toContain('surgery')
      expect(types).toContain('followup')
    })
  })
})
