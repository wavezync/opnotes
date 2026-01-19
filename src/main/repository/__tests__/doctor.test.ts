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
import * as doctorRepo from '../doctor'

describe('Doctor Repository', () => {
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

  describe('createNewDoctor', () => {
    it('should create a new doctor with all fields', async () => {
      const doctorData = {
        name: 'Dr. Sarah Wilson',
        designation: 'Senior Consultant'
      }

      const result = await doctorRepo.createNewDoctor(doctorData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.name).toBe('Dr. Sarah Wilson')
      expect(result.designation).toBe('Senior Consultant')
      expect(result.created_at).toBeDefined()
      expect(result.updated_at).toBeDefined()
    })

    it('should create a doctor with only required fields', async () => {
      const doctorData = {
        name: 'Dr. John Doe'
      }

      const result = await doctorRepo.createNewDoctor(doctorData)

      expect(result).toBeDefined()
      expect(result.name).toBe('Dr. John Doe')
    })
  })

  describe('getDoctorById', () => {
    it('should return null for non-existent doctor', async () => {
      const result = await doctorRepo.getDoctorById(99999)
      expect(result).toBeNull()
    })

    it('should return doctor with correct data', async () => {
      const createResult = await doctorRepo.createNewDoctor({
        name: 'Dr. Test Doctor',
        designation: 'Consultant'
      })

      const doctor = await doctorRepo.getDoctorById(createResult.id)

      expect(doctor).not.toBeNull()
      expect(doctor?.name).toBe('Dr. Test Doctor')
      expect(doctor?.designation).toBe('Consultant')
    })
  })

  describe('updateDoctorById', () => {
    it('should update doctor data', async () => {
      const createResult = await doctorRepo.createNewDoctor({
        name: 'Dr. Original',
        designation: 'Registrar'
      })

      const updatedDoctor = await doctorRepo.updateDoctorById(createResult.id, {
        name: 'Dr. Updated',
        designation: 'Consultant'
      })

      expect(updatedDoctor).not.toBeNull()
      expect(updatedDoctor?.name).toBe('Dr. Updated')
      expect(updatedDoctor?.designation).toBe('Consultant')
    })

    it('should update only specified fields', async () => {
      const createResult = await doctorRepo.createNewDoctor({
        name: 'Dr. Partial',
        designation: 'Registrar'
      })

      const updatedDoctor = await doctorRepo.updateDoctorById(createResult.id, {
        designation: 'Senior Registrar'
      })

      expect(updatedDoctor).not.toBeNull()
      expect(updatedDoctor?.name).toBe('Dr. Partial')
      expect(updatedDoctor?.designation).toBe('Senior Registrar')
    })

    it('should return null when updating non-existent doctor', async () => {
      const result = await doctorRepo.updateDoctorById(99999, { name: 'Test' })
      expect(result).toBeNull()
    })
  })

  describe('listDoctors', () => {
    it('should return empty list when no doctors exist', async () => {
      const result = await doctorRepo.listDoctors({})

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.pages).toBe(0)
    })

    it('should return paginated list of doctors', async () => {
      // Create multiple doctors
      for (let i = 1; i <= 15; i++) {
        await doctorRepo.createNewDoctor({
          name: `Dr. Doctor ${i}`,
          designation: 'Consultant'
        })
      }

      const result = await doctorRepo.listDoctors({ pageSize: 10, page: 1 })

      expect(result.data.length).toBe(10)
      expect(result.total).toBe(15)
      expect(result.pages).toBe(2)
    })

    it('should filter doctors by search term', async () => {
      await doctorRepo.createNewDoctor({
        name: 'Dr. Alice Smith',
        designation: 'Surgeon'
      })

      await doctorRepo.createNewDoctor({
        name: 'Dr. Bob Johnson',
        designation: 'Physician'
      })

      const result = await doctorRepo.listDoctors({ search: 'Alice' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Dr. Alice Smith')
    })

    it('should sort doctors by name', async () => {
      await doctorRepo.createNewDoctor({
        name: 'Dr. Zebra',
        designation: 'Consultant'
      })

      await doctorRepo.createNewDoctor({
        name: 'Dr. Alpha',
        designation: 'Consultant'
      })

      const resultAsc = await doctorRepo.listDoctors({ sortBy: 'name', sortOrder: 'asc' })
      expect(resultAsc.data[0].name).toBe('Dr. Alpha')

      const resultDesc = await doctorRepo.listDoctors({ sortBy: 'name', sortOrder: 'desc' })
      expect(resultDesc.data[0].name).toBe('Dr. Zebra')
    })

    it('should sort doctors by designation', async () => {
      await doctorRepo.createNewDoctor({
        name: 'Dr. First',
        designation: 'Registrar'
      })

      await doctorRepo.createNewDoctor({
        name: 'Dr. Second',
        designation: 'Consultant'
      })

      const resultAsc = await doctorRepo.listDoctors({ sortBy: 'designation', sortOrder: 'asc' })
      expect(resultAsc.data[0].designation).toBe('Consultant')
    })
  })

  describe('deleteDoctorById', () => {
    it('should delete an existing doctor', async () => {
      const createResult = await doctorRepo.createNewDoctor({
        name: 'Dr. To Delete',
        designation: 'Consultant'
      })

      const deleteResult = await doctorRepo.deleteDoctorById(createResult.id)
      expect(deleteResult).toBeDefined()

      const doctor = await doctorRepo.getDoctorById(createResult.id)
      expect(doctor).toBeNull()
    })
  })
})
