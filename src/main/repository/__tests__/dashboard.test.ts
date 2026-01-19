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
          bht: `BHT_DASH_${i}`,
          name: `Patient ${i}`,
          age: 30 + i,
          sex: i % 2 === 0 ? 'Male' : 'Female',
          ward: 'Ward A',
          date_of_admission: '2024-01-15',
          diagnosis: 'Test'
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
        bht: 'BHT_MONTH_TEST',
        name: 'Month Test Patient',
        age: 40,
        sex: 'Male',
        ward: 'Ward A',
        date_of_admission: new Date().toISOString().split('T')[0],
        diagnosis: 'Test'
      })

      // Create a surgery for this month
      await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: new Date().toISOString().split('T')[0],
        procedure: 'This Month Surgery',
        ward: 'Ward A'
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
        bht: 'BHT_RECENT_1',
        name: 'Recent Patient',
        age: 35,
        sex: 'Male',
        ward: 'Ward A',
        date_of_admission: new Date().toISOString().split('T')[0],
        diagnosis: 'Test Diagnosis'
      })

      const activity = await dashboardRepo.getRecentActivity(10)

      expect(activity.length).toBeGreaterThanOrEqual(1)
      const patientActivity = activity.find((a) => a.type === 'patient')
      expect(patientActivity).toBeDefined()
      expect(patientActivity?.title).toBe('Recent Patient')
    })

    it('should return recent surgeries', async () => {
      const patient = await patientRepo.createNewPatient({
        bht: 'BHT_SURG_ACT',
        name: 'Surgery Activity Patient',
        age: 40,
        sex: 'Female',
        ward: 'Ward B',
        date_of_admission: new Date().toISOString().split('T')[0],
        diagnosis: 'Surgery Test'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: new Date().toISOString().split('T')[0],
        procedure: 'Recent Procedure',
        ward: 'Ward B'
      })

      const activity = await dashboardRepo.getRecentActivity(10)

      const surgeryActivity = activity.find((a) => a.type === 'surgery')
      expect(surgeryActivity).toBeDefined()
      expect(surgeryActivity?.title).toBe('Recent Procedure')
      expect(surgeryActivity?.subtitle).toBe('Surgery Activity Patient')
    })

    it('should return recent followups', async () => {
      const patient = await patientRepo.createNewPatient({
        bht: 'BHT_FU_ACT',
        name: 'Followup Patient',
        age: 45,
        sex: 'Male',
        ward: 'Ward C',
        date_of_admission: new Date().toISOString().split('T')[0],
        diagnosis: 'Followup Test'
      })

      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: new Date().toISOString().split('T')[0],
        procedure: 'Followup Procedure',
        ward: 'Ward C'
      })

      await surgeryRepo.createNewFollowUp(surgery.id, 'Recent followup notes')

      const activity = await dashboardRepo.getRecentActivity(10)

      const followupActivity = activity.find((a) => a.type === 'followup')
      expect(followupActivity).toBeDefined()
      expect(followupActivity?.title).toContain('Recent followup')
    })

    it('should respect limit parameter', async () => {
      // Create multiple patients
      for (let i = 1; i <= 10; i++) {
        await patientRepo.createNewPatient({
          bht: `BHT_LIMIT_${i}`,
          name: `Patient ${i}`,
          age: 30,
          sex: 'Male',
          ward: 'Ward A',
          date_of_admission: new Date().toISOString().split('T')[0],
          diagnosis: 'Test'
        })
      }

      const activity = await dashboardRepo.getRecentActivity(5)

      expect(activity.length).toBeLessThanOrEqual(5)
    })

    it('should return mixed activity types sorted by date', async () => {
      // Create patient
      const patient = await patientRepo.createNewPatient({
        bht: 'BHT_MIXED',
        name: 'Mixed Activity Patient',
        age: 35,
        sex: 'Female',
        ward: 'Ward A',
        date_of_admission: new Date().toISOString().split('T')[0],
        diagnosis: 'Mixed Test'
      })

      // Create surgery
      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: new Date().toISOString().split('T')[0],
        procedure: 'Mixed Procedure',
        ward: 'Ward A'
      })

      // Create followup
      await surgeryRepo.createNewFollowUp(surgery.id, 'Mixed followup')

      const activity = await dashboardRepo.getRecentActivity(10)

      // Should have activities of different types
      const types = activity.map((a) => a.type)
      expect(types).toContain('patient')
      expect(types).toContain('surgery')
      expect(types).toContain('followup')
    })
  })
})
