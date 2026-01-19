import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { Kysely } from 'kysely'
import { Database } from '../../src/shared/types/db'
import { createMigratedTestDb, cleanupTestDb, closeTestDb } from '../helpers/test-db'

// Mock the db module before importing repositories
vi.mock('../../src/main/db', async () => {
  const testDb = await import('../helpers/test-db')
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

// Import after mocks
import * as patientRepo from '../../src/main/repository/patient'
import * as surgeryRepo from '../../src/main/repository/surgery'
import * as doctorRepo from '../../src/main/repository/doctor'
import * as dashboardRepo from '../../src/main/repository/dashboard'

describe('Patient-Surgery Workflow Integration', () => {
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

  describe('Complete Surgery Workflow', () => {
    it('should create patient, add surgery with doctors, and add followups', async () => {
      // Step 1: Create a patient
      const patient = await patientRepo.createNewPatient({
        bht: 'WORKFLOW_001',
        name: 'Workflow Test Patient',
        age: 45,
        sex: 'Male',
        ward: 'Surgical Ward',
        date_of_admission: '2024-01-15',
        diagnosis: 'Acute Appendicitis'
      })

      expect(patient).toBeDefined()
      expect(patient.id).toBeDefined()

      // Step 2: Create doctors
      const surgeon = await doctorRepo.createNewDoctor({
        name: 'Dr. Primary Surgeon',
        designation: 'Consultant Surgeon'
      })

      const assistant = await doctorRepo.createNewDoctor({
        name: 'Dr. Assistant',
        designation: 'Registrar'
      })

      expect(surgeon.id).toBeDefined()
      expect(assistant.id).toBeDefined()

      // Step 3: Create surgery
      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: '2024-01-16',
        procedure: 'Laparoscopic Appendectomy',
        indication: 'Acute appendicitis',
        findings: 'Inflamed appendix with localized peritonitis',
        procedure_details: 'Standard three-port laparoscopic appendectomy',
        outcome: 'Successful',
        ward: 'Surgical Ward'
      })

      expect(surgery.id).toBeDefined()

      // Step 4: Associate doctors with surgery
      await surgeryRepo.updateSurgeryDoctorsDoneBy(surgery.id, [surgeon.id])
      await surgeryRepo.updateSurgeryDoctorsAssistedBy(surgery.id, [assistant.id])

      // Verify surgery has correct associations
      const fullSurgery = await surgeryRepo.getSurgeryById(surgery.id)
      expect(fullSurgery?.doneBy?.length).toBe(1)
      expect(fullSurgery?.doneBy?.[0].name).toBe('Dr. Primary Surgeon')
      expect(fullSurgery?.assistedBy?.length).toBe(1)
      expect(fullSurgery?.assistedBy?.[0].name).toBe('Dr. Assistant')

      // Step 5: Add followup notes
      const followup1 = await surgeryRepo.createNewFollowUp(
        surgery.id,
        'Post-op day 1: Patient stable, minimal pain, tolerating liquids'
      )

      const followup2 = await surgeryRepo.createNewFollowUp(
        surgery.id,
        'Post-op day 3: Patient ambulatory, ready for discharge'
      )

      expect(followup1?.id).toBeDefined()
      expect(followup2?.id).toBeDefined()

      // Step 6: Verify complete patient history
      const patientData = await patientRepo.getPatientById(patient.id)
      expect(patientData).not.toBeNull()

      const surgeries = await surgeryRepo.listSurgeries({ patient_id: patient.id })
      expect(surgeries.data.length).toBe(1)

      const followups = await surgeryRepo.getFollowUpsBySurgeryId(surgery.id)
      expect(followups.length).toBe(2)
    })

    it('should correctly reflect in dashboard stats', async () => {
      // Create a patient and surgery for this month
      const patient = await patientRepo.createNewPatient({
        bht: 'DASHBOARD_001',
        name: 'Dashboard Test Patient',
        age: 35,
        sex: 'Female',
        ward: 'Ward A',
        date_of_admission: new Date().toISOString().split('T')[0],
        diagnosis: 'Test'
      })

      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: new Date().toISOString().split('T')[0],
        procedure: 'Test Procedure',
        ward: 'Ward A'
      })

      await surgeryRepo.createNewFollowUp(surgery.id, 'Test followup')

      // Check dashboard stats
      const stats = await dashboardRepo.getDashboardStats()

      expect(stats.totalPatients).toBe(1)
      expect(stats.totalSurgeries).toBe(1)
      expect(stats.patientsThisMonth).toBeGreaterThanOrEqual(1)
      expect(stats.surgeriesThisMonth).toBeGreaterThanOrEqual(1)

      // Check recent activity
      const activity = await dashboardRepo.getRecentActivity(10)
      expect(activity.length).toBeGreaterThanOrEqual(3) // patient + surgery + followup
    })
  })

  describe('Doctor Surgery History', () => {
    it('should track all surgeries for a doctor across multiple patients', async () => {
      // Create a doctor
      const doctor = await doctorRepo.createNewDoctor({
        name: 'Dr. Multi-Case Surgeon',
        designation: 'Senior Consultant'
      })

      // Create multiple patients and surgeries
      for (let i = 1; i <= 3; i++) {
        const patient = await patientRepo.createNewPatient({
          bht: `MULTI_${i}`,
          name: `Patient ${i}`,
          age: 30 + i,
          sex: i % 2 === 0 ? 'Female' : 'Male',
          ward: 'Ward A',
          date_of_admission: `2024-01-${10 + i}`,
          diagnosis: `Diagnosis ${i}`
        })

        const surgery = await surgeryRepo.createNewSurgery({
          patient_id: patient.id,
          date: `2024-01-${15 + i}`,
          procedure: `Procedure ${i}`,
          ward: 'Ward A'
        })

        // Alternate between done_by and assisted_by
        if (i % 2 === 1) {
          await surgeryRepo.updateSurgeryDoctorsDoneBy(surgery.id, [doctor.id])
        } else {
          await surgeryRepo.updateSurgeryDoctorsAssistedBy(surgery.id, [doctor.id])
        }
      }

      // Check doctor's surgery history
      const doctorSurgeries = await surgeryRepo.listSurgeriesByDoctorId(doctor.id, {})

      expect(doctorSurgeries.total).toBe(3)

      // Verify roles are correctly assigned
      const roles = doctorSurgeries.data.map((s) => s.role)
      expect(roles.filter((r) => r === 'done_by').length).toBe(2)
      expect(roles.filter((r) => r === 'assisted_by').length).toBe(1)
    })
  })

  describe('Cascade Delete Behavior', () => {
    it('should delete surgery followups when surgery is deleted', async () => {
      const patient = await patientRepo.createNewPatient({
        bht: 'CASCADE_001',
        name: 'Cascade Test Patient',
        age: 40,
        sex: 'Male',
        ward: 'Ward A',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
      })

      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: '2024-01-16',
        procedure: 'Test Procedure',
        ward: 'Ward A'
      })

      // Add followups
      await surgeryRepo.createNewFollowUp(surgery.id, 'Followup 1')
      await surgeryRepo.createNewFollowUp(surgery.id, 'Followup 2')
      await surgeryRepo.createNewFollowUp(surgery.id, 'Followup 3')

      // Verify followups exist
      let followups = await surgeryRepo.getFollowUpsBySurgeryId(surgery.id)
      expect(followups.length).toBe(3)

      // Delete surgery
      await surgeryRepo.deleteSurgeryById(surgery.id)

      // Verify surgery and followups are deleted
      const deletedSurgery = await surgeryRepo.getSurgeryById(surgery.id)
      expect(deletedSurgery).toBeNull()

      followups = await surgeryRepo.getFollowUpsBySurgeryId(surgery.id)
      expect(followups.length).toBe(0)
    })

    it('should handle patient deletion with surgeries', async () => {
      const patient = await patientRepo.createNewPatient({
        bht: 'CASCADE_002',
        name: 'Patient To Delete',
        age: 50,
        sex: 'Female',
        ward: 'Ward B',
        date_of_admission: '2024-01-15',
        diagnosis: 'Test'
      })

      // Add a surgery
      await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: '2024-01-16',
        procedure: 'Test Procedure',
        ward: 'Ward B'
      })

      // Delete patient
      await patientRepo.deletePatientById(patient.id)

      // Verify patient is deleted
      const deletedPatient = await patientRepo.getPatientById(patient.id)
      expect(deletedPatient).toBeNull()
    })
  })
})
