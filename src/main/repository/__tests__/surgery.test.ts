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
import * as surgeryRepo from '../surgery'
import * as patientRepo from '../patient'
import * as doctorRepo from '../doctor'

describe('Surgery Repository', () => {
  let testDb: Kysely<Database>
  let testPatientId: number
  let testDoctorId: number

  beforeAll(async () => {
    testDb = await createMigratedTestDb()
  })

  afterAll(async () => {
    await closeTestDb(testDb)
  })

  beforeEach(async () => {
    await cleanupTestDb(testDb)

    // Create a test patient for surgeries
    const patient = await patientRepo.createNewPatient({
      bht: 'BHT_SURGERY_TEST',
      name: 'Surgery Test Patient',
      age: 45,
      sex: 'Male',
      ward: 'Ward A',
      date_of_admission: '2024-01-15',
      diagnosis: 'Test Diagnosis'
    })
    testPatientId = patient.id

    // Create a test doctor for surgeries
    const doctor = await doctorRepo.createNewDoctor({
      name: 'Dr. Surgery Test',
      designation: 'Surgeon'
    })
    testDoctorId = doctor.id
  })

  describe('createNewSurgery', () => {
    it('should create a new surgery with required fields', async () => {
      const surgeryData = {
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Test Procedure',
        ward: 'Ward A'
      }

      const result = await surgeryRepo.createNewSurgery(surgeryData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(typeof result.id).toBe('number')
    })

    it('should create a surgery with all fields', async () => {
      const surgeryData = {
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Appendectomy',
        indication: 'Acute appendicitis',
        findings: 'Inflamed appendix',
        procedure_details: 'Laparoscopic appendectomy performed',
        outcome: 'Successful',
        ward: 'Ward A'
      }

      const result = await surgeryRepo.createNewSurgery(surgeryData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
    })
  })

  describe('getSurgeryById', () => {
    it('should return null for non-existent surgery', async () => {
      const result = await surgeryRepo.getSurgeryById(99999)
      expect(result).toBeNull()
    })

    it('should return surgery with correct data', async () => {
      const createResult = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Test Procedure',
        indication: 'Test Indication',
        ward: 'Ward B'
      })

      const surgery = await surgeryRepo.getSurgeryById(createResult.id)

      expect(surgery).not.toBeNull()
      expect(surgery?.procedure).toBe('Test Procedure')
      expect(surgery?.indication).toBe('Test Indication')
      expect(surgery?.patient_id).toBe(testPatientId)
    })

    it('should include doctor associations', async () => {
      const createResult = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Doctor Association Test',
        ward: 'Ward A'
      })

      await surgeryRepo.updateSurgeryDoctorsDoneBy(createResult.id, [testDoctorId])

      const surgery = await surgeryRepo.getSurgeryById(createResult.id)

      expect(surgery).not.toBeNull()
      expect(surgery?.doneBy).toBeDefined()
      expect(surgery?.doneBy?.length).toBe(1)
      expect(surgery?.doneBy?.[0].id).toBe(testDoctorId)
    })
  })

  describe('updateSurgery', () => {
    it('should update surgery data', async () => {
      const createResult = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Original Procedure',
        ward: 'Ward A'
      })

      const updateResult = await surgeryRepo.updateSurgery(createResult.id, {
        procedure: 'Updated Procedure',
        outcome: 'Successful'
      })

      expect(updateResult).toBeDefined()

      const surgery = await surgeryRepo.getSurgeryById(createResult.id)
      expect(surgery?.procedure).toBe('Updated Procedure')
      expect(surgery?.outcome).toBe('Successful')
    })
  })

  describe('updateSurgeryDoctorsDoneBy', () => {
    it('should associate doctors with surgery as done by', async () => {
      const createResult = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Doctor Test',
        ward: 'Ward A'
      })

      await surgeryRepo.updateSurgeryDoctorsDoneBy(createResult.id, [testDoctorId])

      const surgery = await surgeryRepo.getSurgeryById(createResult.id)
      expect(surgery?.doneBy?.length).toBe(1)
      expect(surgery?.doneBy?.[0].id).toBe(testDoctorId)
    })

    it('should replace existing done by doctors', async () => {
      const doctor2 = await doctorRepo.createNewDoctor({
        name: 'Dr. Second',
        designation: 'Consultant'
      })

      const createResult = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Replace Doctor Test',
        ward: 'Ward A'
      })

      await surgeryRepo.updateSurgeryDoctorsDoneBy(createResult.id, [testDoctorId])
      await surgeryRepo.updateSurgeryDoctorsDoneBy(createResult.id, [doctor2.id])

      const surgery = await surgeryRepo.getSurgeryById(createResult.id)
      expect(surgery?.doneBy?.length).toBe(1)
      expect(surgery?.doneBy?.[0].id).toBe(doctor2.id)
    })
  })

  describe('updateSurgeryDoctorsAssistedBy', () => {
    it('should associate doctors with surgery as assisted by', async () => {
      const createResult = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Assistant Test',
        ward: 'Ward A'
      })

      await surgeryRepo.updateSurgeryDoctorsAssistedBy(createResult.id, [testDoctorId])

      const surgery = await surgeryRepo.getSurgeryById(createResult.id)
      expect(surgery?.assistedBy?.length).toBe(1)
      expect(surgery?.assistedBy?.[0].id).toBe(testDoctorId)
    })
  })

  describe('listSurgeries', () => {
    it('should return empty list when no surgeries exist', async () => {
      const result = await surgeryRepo.listSurgeries({})

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.pages).toBe(0)
    })

    it('should return paginated list of surgeries', async () => {
      for (let i = 1; i <= 15; i++) {
        await surgeryRepo.createNewSurgery({
          patient_id: testPatientId,
          date: '2024-01-16',
          procedure: `Procedure ${i}`,
          ward: 'Ward A'
        })
      }

      const result = await surgeryRepo.listSurgeries({ pageSize: 10, page: 1 })

      expect(result.data.length).toBe(10)
      expect(result.total).toBe(15)
      expect(result.pages).toBe(2)
    })

    it('should filter surgeries by patient_id', async () => {
      // Create another patient
      const patient2 = await patientRepo.createNewPatient({
        bht: 'BHT_PATIENT2',
        name: 'Second Patient',
        age: 30,
        sex: 'Female',
        ward: 'Ward B',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'First Patient Surgery',
        ward: 'Ward A'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: patient2.id,
        date: '2024-01-17',
        procedure: 'Second Patient Surgery',
        ward: 'Ward B'
      })

      const result = await surgeryRepo.listSurgeries({ patient_id: testPatientId })

      expect(result.data.length).toBe(1)
      expect(result.data[0].procedure).toBe('First Patient Surgery')
    })

    it('should filter surgeries by ward', async () => {
      await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Ward A Surgery',
        ward: 'Ward A'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-17',
        procedure: 'Ward B Surgery',
        ward: 'Ward B'
      })

      const result = await surgeryRepo.listSurgeries({ ward: 'Ward A' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].procedure).toBe('Ward A Surgery')
    })

    it('should filter surgeries by date range', async () => {
      await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-10',
        procedure: 'Earlier Surgery',
        ward: 'Ward A'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-20',
        procedure: 'Later Surgery',
        ward: 'Ward A'
      })

      const result = await surgeryRepo.listSurgeries({
        start_date: '2024-01-15',
        end_date: '2024-01-25'
      })

      expect(result.data.length).toBe(1)
      expect(result.data[0].procedure).toBe('Later Surgery')
    })
  })

  describe('Followups', () => {
    let testSurgeryId: number

    beforeEach(async () => {
      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Followup Test Surgery',
        ward: 'Ward A'
      })
      testSurgeryId = surgery.id
    })

    describe('createNewFollowUp', () => {
      it('should create a followup for a surgery', async () => {
        const result = await surgeryRepo.createNewFollowUp(
          testSurgeryId,
          'Patient recovering well'
        )

        expect(result).not.toBeNull()
        expect(result?.notes).toBe('Patient recovering well')
        expect(result?.surgery_id).toBe(testSurgeryId)
      })
    })

    describe('getFollowUpsBySurgeryId', () => {
      it('should return empty array when no followups exist', async () => {
        const result = await surgeryRepo.getFollowUpsBySurgeryId(testSurgeryId)
        expect(result).toEqual([])
      })

      it('should return all followups for a surgery', async () => {
        await surgeryRepo.createNewFollowUp(testSurgeryId, 'First followup')
        await surgeryRepo.createNewFollowUp(testSurgeryId, 'Second followup')

        const result = await surgeryRepo.getFollowUpsBySurgeryId(testSurgeryId)

        expect(result.length).toBe(2)
      })
    })

    describe('updateFollowUp', () => {
      it('should update followup notes', async () => {
        const followup = await surgeryRepo.createNewFollowUp(
          testSurgeryId,
          'Original notes'
        )

        const updated = await surgeryRepo.updateFollowUp(followup!.id, 'Updated notes')

        expect(updated?.notes).toBe('Updated notes')
      })
    })

    describe('deleteFollowUp', () => {
      it('should delete a followup', async () => {
        const followup = await surgeryRepo.createNewFollowUp(
          testSurgeryId,
          'To be deleted'
        )

        await surgeryRepo.deleteFollowUp(followup!.id)

        const followups = await surgeryRepo.getFollowUpsBySurgeryId(testSurgeryId)
        expect(followups.length).toBe(0)
      })
    })
  })

  describe('deleteSurgeryById', () => {
    it('should delete a surgery and its followups', async () => {
      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'To Delete',
        ward: 'Ward A'
      })

      await surgeryRepo.createNewFollowUp(surgery.id, 'Followup 1')
      await surgeryRepo.createNewFollowUp(surgery.id, 'Followup 2')

      await surgeryRepo.deleteSurgeryById(surgery.id)

      const deletedSurgery = await surgeryRepo.getSurgeryById(surgery.id)
      expect(deletedSurgery).toBeNull()

      const followups = await surgeryRepo.getFollowUpsBySurgeryId(surgery.id)
      expect(followups.length).toBe(0)
    })
  })

  describe('getWards', () => {
    it('should return distinct ward values', async () => {
      await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Surgery 1',
        ward: 'Ward A'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-17',
        procedure: 'Surgery 2',
        ward: 'Ward B'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-18',
        procedure: 'Surgery 3',
        ward: 'Ward A'
      })

      const wards = await surgeryRepo.getWards()

      expect(wards).toContain('Ward A')
      expect(wards).toContain('Ward B')
      expect(wards.length).toBe(2)
    })
  })

  describe('listSurgeriesByDoctorId', () => {
    it('should return surgeries where doctor was primary surgeon', async () => {
      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Primary Surgery',
        ward: 'Ward A'
      })

      await surgeryRepo.updateSurgeryDoctorsDoneBy(surgery.id, [testDoctorId])

      const result = await surgeryRepo.listSurgeriesByDoctorId(testDoctorId, {})

      expect(result.data.length).toBe(1)
      expect(result.data[0].procedure).toBe('Primary Surgery')
      expect(result.data[0].role).toBe('done_by')
    })

    it('should return surgeries where doctor assisted', async () => {
      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: testPatientId,
        date: '2024-01-16',
        procedure: 'Assisted Surgery',
        ward: 'Ward A'
      })

      await surgeryRepo.updateSurgeryDoctorsAssistedBy(surgery.id, [testDoctorId])

      const result = await surgeryRepo.listSurgeriesByDoctorId(testDoctorId, {})

      expect(result.data.length).toBe(1)
      expect(result.data[0].procedure).toBe('Assisted Surgery')
      expect(result.data[0].role).toBe('assisted_by')
    })
  })
})
