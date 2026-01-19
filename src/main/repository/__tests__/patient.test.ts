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
        bht: 'BHT001',
        name: 'John Doe',
        age: 45,
        sex: 'Male',
        ward: 'Ward A',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test Diagnosis'
      }

      const result = await patientRepo.createNewPatient(patientData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('number')
    })

    it('should create a patient with all optional fields', async () => {
      const patientData = {
        bht: 'BHT002',
        name: 'Jane Smith',
        age: 32,
        sex: 'Female',
        ward: 'Ward B',
        date_of_admission: '2024-01-16',
        diagnosis: 'Another Diagnosis',
        date_of_discharge: '2024-01-20',
        blood_group: 'A+',
        phone: '123-456-7890',
        allergies: 'Penicillin',
        chronic_conditions: 'Diabetes',
        current_medications: 'Metformin',
        previous_surgeries: 'Appendectomy 2015'
      }

      const result = await patientRepo.createNewPatient(patientData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
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
        bht: 'BHT003',
        name: 'Test Patient',
        age: 40,
        sex: 'Male',
        ward: 'Ward C',
        date_of_admission: '2024-01-17',
        diagnosis: 'Test'
      })

      const patient = await patientRepo.getPatientById(createResult.id)

      expect(patient).not.toBeNull()
      expect(patient?.name).toBe('Test Patient')
      expect(patient?.bht).toBe('BHT003')
      expect(patient?.age).toBe(40)
    })
  })

  describe('updatePatientById', () => {
    it('should update patient data', async () => {
      // Create a patient first
      const createResult = await patientRepo.createNewPatient({
        bht: 'BHT004',
        name: 'Original Name',
        age: 35,
        sex: 'Female',
        ward: 'Ward D',
        date_of_admission: '2024-01-18',
        diagnosis: 'Original Diagnosis'
      })

      // Update the patient
      const updatedPatient = await patientRepo.updatePatientById(createResult.id, {
        name: 'Updated Name',
        diagnosis: 'Updated Diagnosis'
      })

      expect(updatedPatient).not.toBeNull()
      expect(updatedPatient?.name).toBe('Updated Name')
      expect(updatedPatient?.diagnosis).toBe('Updated Diagnosis')
      // Original values should remain
      expect(updatedPatient?.bht).toBe('BHT004')
    })

    it('should return null when updating non-existent patient', async () => {
      const result = await patientRepo.updatePatientById(99999, { name: 'Test' })
      expect(result).toBeNull()
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
          bht: `BHT${String(i).padStart(3, '0')}`,
          name: `Patient ${i}`,
          age: 20 + i,
          sex: i % 2 === 0 ? 'Male' : 'Female',
          ward: 'Ward A',
          date_of_admission: '2024-01-15',
          diagnosis: 'Test'
        })
      }

      const result = await patientRepo.listPatients({ pageSize: 10, page: 1 })

      expect(result.data.length).toBe(10)
      expect(result.total).toBe(15)
      expect(result.pages).toBe(2)
    })

    it('should filter patients by search term', async () => {
      await patientRepo.createNewPatient({
        bht: 'BHT100',
        name: 'John Unique',
        age: 40,
        sex: 'Male',
        ward: 'Ward A',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
      })

      await patientRepo.createNewPatient({
        bht: 'BHT101',
        name: 'Jane Different',
        age: 35,
        sex: 'Female',
        ward: 'Ward B',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
      })

      const result = await patientRepo.listPatients({ search: 'John' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('John Unique')
    })

    it('should sort patients by name', async () => {
      await patientRepo.createNewPatient({
        bht: 'BHT200',
        name: 'Zebra Patient',
        age: 40,
        sex: 'Male',
        ward: 'Ward A',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
      })

      await patientRepo.createNewPatient({
        bht: 'BHT201',
        name: 'Apple Patient',
        age: 35,
        sex: 'Female',
        ward: 'Ward A',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
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
        bht: 'BHT_DEL',
        name: 'To Be Deleted',
        age: 50,
        sex: 'Male',
        ward: 'Ward X',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
      })

      await patientRepo.deletePatientById(createResult.id)

      const patient = await patientRepo.getPatientById(createResult.id)
      expect(patient).toBeNull()
    })
  })

  describe('findPatientByPHN', () => {
    it('should find patient by PHN (BHT)', async () => {
      await patientRepo.createNewPatient({
        bht: 'UNIQUE_PHN_123',
        name: 'PHN Patient',
        age: 45,
        sex: 'Male',
        ward: 'Ward A',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
      })

      const patient = await patientRepo.findPatientByPHN('UNIQUE_PHN_123')

      expect(patient).toBeDefined()
      expect(patient?.bht).toBe('UNIQUE_PHN_123')
      expect(patient?.name).toBe('PHN Patient')
    })

    it('should return undefined for non-existent PHN', async () => {
      const patient = await patientRepo.findPatientByPHN('NON_EXISTENT')
      expect(patient).toBeUndefined()
    })
  })

  describe('countAllPatients', () => {
    it('should return 0 when no patients exist', async () => {
      const count = await patientRepo.countAllPatients()
      expect(count).toBe(0)
    })

    it('should return correct count after adding patients', async () => {
      for (let i = 1; i <= 5; i++) {
        await patientRepo.createNewPatient({
          bht: `BHT_COUNT_${i}`,
          name: `Patient ${i}`,
          age: 30,
          sex: 'Male',
          ward: 'Ward A',
          date_of_admission: '2024-01-15',
          diagnosis: 'Test'
        })
      }

      const count = await patientRepo.countAllPatients()
      expect(count).toBe(5)
    })
  })
})
