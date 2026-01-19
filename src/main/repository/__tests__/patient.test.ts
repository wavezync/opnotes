import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { Kysely } from 'kysely'
import { Database } from '../../../shared/types/db'
import { createMigratedTestDb, cleanupTestDb, closeTestDb } from '../../../../tests/helpers/test-db'
import * as patientRepo from '../patient'

// We need to inject the test db into the repository
// Since the repository imports db directly, we'll need to mock it
import { vi } from 'vitest'

// Mock the db module
vi.mock('../../db', async () => {
  const testDb = await import('../../../../tests/helpers/test-db')
  const db = await testDb.createMigratedTestDb()
  return { db }
})

// Also mock electron-log for activity logging
vi.mock('electron-log', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

describe('Patient Repository', () => {
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

  describe('createNewPatient', () => {
    it('should create a new patient with required fields', async () => {
      const patientData = {
        phn: 'PHN001',
        name: 'John Doe',
        birth_year: 1980,
        gender: 'M' as const
      }

      const result = await patientRepo.createNewPatient(patientData)

      expect(result).toBeDefined()
      expect(result?.id).toBeDefined()
      expect(typeof result?.id).toBe('number')
    })

    it('should create a patient with all optional fields', async () => {
      const patientData = {
        phn: 'PHN002',
        name: 'Jane Smith',
        birth_year: 1992,
        gender: 'F' as const,
        address: '123 Main St',
        phone: '123-456-7890',
        emergency_contact: 'John Smith',
        emergency_phone: '098-765-4321',
        remarks: 'No special notes',
        blood_group: 'A+',
        allergies: 'Penicillin,Peanuts',
        conditions: 'Diabetes',
        medications: 'Metformin'
      }

      const result = await patientRepo.createNewPatient(patientData)

      expect(result).toBeDefined()
      expect(result?.id).toBeDefined()
    })
  })

  describe('getPatientById', () => {
    it('should return null for non-existent patient', async () => {
      const result = await patientRepo.getPatientById(99999)
      expect(result).toBeNull()
    })

    it('should return patient with correct data', async () => {
      // First create a patient
      const createResult = await patientRepo.createNewPatient({
        phn: 'PHN003',
        name: 'Test Patient',
        birth_year: 1985,
        gender: 'M' as const
      })

      const patient = await patientRepo.getPatientById(createResult!.id)

      expect(patient).not.toBeNull()
      expect(patient?.name).toBe('Test Patient')
      expect(patient?.phn).toBe('PHN003')
      expect(patient?.birth_year).toBe(1985)
    })
  })

  describe('updatePatientById', () => {
    it('should update patient data', async () => {
      // Create a patient first
      const createResult = await patientRepo.createNewPatient({
        phn: 'PHN004',
        name: 'Original Name',
        birth_year: 1990,
        gender: 'F' as const
      })

      // Update the patient
      const updatedPatient = await patientRepo.updatePatientById(createResult!.id, {
        name: 'Updated Name',
        address: '456 New St'
      })

      expect(updatedPatient).not.toBeNull()
      expect(updatedPatient?.name).toBe('Updated Name')
      expect(updatedPatient?.address).toBe('456 New St')
      // Original values should remain
      expect(updatedPatient?.phn).toBe('PHN004')
    })

    it('should return undefined when updating non-existent patient', async () => {
      const result = await patientRepo.updatePatientById(99999, { name: 'Test' })
      expect(result).toBeUndefined()
    })
  })

  describe('listPatients', () => {
    it('should return empty list when no patients exist', async () => {
      const result = await patientRepo.listPatients({})

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.pages).toBe(0)
    })

    it('should return paginated list of patients', async () => {
      // Create multiple patients
      for (let i = 1; i <= 15; i++) {
        await patientRepo.createNewPatient({
          phn: `PHN${String(i).padStart(3, '0')}`,
          name: `Patient ${i}`,
          birth_year: 2000 - i,
          gender: i % 2 === 0 ? 'M' : 'F'
        })
      }

      const result = await patientRepo.listPatients({ pageSize: 10, page: 0 })

      expect(result.data.length).toBe(10)
      expect(result.total).toBe(15)
      expect(result.pages).toBe(2)
    })

    it('should sort patients by name', async () => {
      await patientRepo.createNewPatient({
        phn: 'PHN200',
        name: 'Zebra Patient',
        birth_year: 1985,
        gender: 'M'
      })

      await patientRepo.createNewPatient({
        phn: 'PHN201',
        name: 'Apple Patient',
        birth_year: 1990,
        gender: 'F'
      })

      const resultAsc = await patientRepo.listPatients({ sortBy: 'name', sortOrder: 'asc' })
      expect(resultAsc.data[0].name).toBe('Apple Patient')

      const resultDesc = await patientRepo.listPatients({ sortBy: 'name', sortOrder: 'desc' })
      expect(resultDesc.data[0].name).toBe('Zebra Patient')
    })
  })

  describe('deletePatientById', () => {
    it('should delete an existing patient', async () => {
      const createResult = await patientRepo.createNewPatient({
        phn: 'PHN_DEL',
        name: 'To Be Deleted',
        birth_year: 1975,
        gender: 'M'
      })

      await patientRepo.deletePatientById(createResult!.id)

      const patient = await patientRepo.getPatientById(createResult!.id)
      expect(patient).toBeNull()
    })
  })

  describe('findPatientByPHN', () => {
    it('should find patient by PHN', async () => {
      await patientRepo.createNewPatient({
        phn: 'UNIQUE_PHN_123',
        name: 'PHN Patient',
        birth_year: 1980,
        gender: 'M'
      })

      const patient = await patientRepo.findPatientByPHN('UNIQUE_PHN_123')

      expect(patient).toBeDefined()
      expect(patient?.phn).toBe('UNIQUE_PHN_123')
      expect(patient?.name).toBe('PHN Patient')
    })

    it('should return undefined for non-existent PHN', async () => {
      const patient = await patientRepo.findPatientByPHN('NON_EXISTENT')
      expect(patient).toBeUndefined()
    })
  })

  describe('countAllPatients', () => {
    it('should return object with total 0 when no patients exist', async () => {
      const count = await patientRepo.countAllPatients()
      expect(count?.total).toBe(0)
    })

    it('should return correct count after adding patients', async () => {
      for (let i = 1; i <= 5; i++) {
        await patientRepo.createNewPatient({
          phn: `PHN_COUNT_${i}`,
          name: `Patient ${i}`,
          birth_year: 1995,
          gender: 'M'
        })
      }

      const count = await patientRepo.countAllPatients()
      expect(count?.total).toBe(5)
    })
  })
})
