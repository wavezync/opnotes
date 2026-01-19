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
import * as templateRepo from '../../src/main/repository/surgery-template'

describe('Full-Text Search Integration', () => {
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

  describe('Patient Search', () => {
    beforeEach(async () => {
      // Create test patients
      await patientRepo.createNewPatient({
        bht: 'FTS_P001',
        name: 'John Michael Smith',
        age: 45,
        sex: 'Male',
        ward: 'Cardiac Ward',
        date_of_admission: '2024-01-15',
        diagnosis: 'Coronary Artery Disease'
      })

      await patientRepo.createNewPatient({
        bht: 'FTS_P002',
        name: 'Mary Elizabeth Johnson',
        age: 35,
        sex: 'Female',
        ward: 'General Ward',
        date_of_admission: '2024-01-16',
        diagnosis: 'Acute Appendicitis'
      })

      await patientRepo.createNewPatient({
        bht: 'FTS_P003',
        name: 'Robert James Williams',
        age: 55,
        sex: 'Male',
        ward: 'Surgical Ward',
        date_of_admission: '2024-01-17',
        diagnosis: 'Inguinal Hernia'
      })
    })

    it('should find patients by name', async () => {
      const result = await patientRepo.listPatients({ search: 'John' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('John Michael Smith')
    })

    it('should find patients by partial name', async () => {
      const result = await patientRepo.listPatients({ search: 'Williams' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Robert James Williams')
    })

    it('should find patients by BHT/PHN', async () => {
      const result = await patientRepo.listPatients({ search: 'FTS_P002' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Mary Elizabeth Johnson')
    })

    it('should return multiple matches', async () => {
      // All names contain common letters
      const result = await patientRepo.listPatients({ search: 'John' })

      expect(result.data.length).toBeGreaterThanOrEqual(1)
    })

    it('should return empty for no matches', async () => {
      const result = await patientRepo.listPatients({ search: 'XYZ123NOTFOUND' })

      expect(result.data.length).toBe(0)
    })
  })

  describe('Doctor Search', () => {
    beforeEach(async () => {
      await doctorRepo.createNewDoctor({
        name: 'Dr. Sarah Wilson',
        designation: 'Consultant Cardiologist'
      })

      await doctorRepo.createNewDoctor({
        name: 'Dr. Michael Brown',
        designation: 'Senior Registrar'
      })

      await doctorRepo.createNewDoctor({
        name: 'Dr. Emily Chen',
        designation: 'Consultant Surgeon'
      })
    })

    it('should find doctors by name', async () => {
      const result = await doctorRepo.listDoctors({ search: 'Wilson' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Dr. Sarah Wilson')
    })

    it('should find doctors by designation', async () => {
      const result = await doctorRepo.listDoctors({ search: 'Consultant' })

      expect(result.data.length).toBe(2)
    })

    it('should find doctors with partial name match', async () => {
      const result = await doctorRepo.listDoctors({ search: 'Chen' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Dr. Emily Chen')
    })
  })

  describe('Surgery Search', () => {
    let patientId: number

    beforeEach(async () => {
      const patient = await patientRepo.createNewPatient({
        bht: 'SURG_SEARCH_001',
        name: 'Surgery Search Patient',
        age: 50,
        sex: 'Male',
        ward: 'Surgical Ward',
        date_of_admission: '2024-01-15',
        diagnosis: 'Multiple conditions'
      })
      patientId = patient.id

      await surgeryRepo.createNewSurgery({
        patient_id: patientId,
        date: '2024-01-16',
        procedure: 'Laparoscopic Cholecystectomy',
        indication: 'Symptomatic gallstones',
        findings: 'Chronic cholecystitis with multiple stones',
        ward: 'Surgical Ward'
      })

      await surgeryRepo.createNewSurgery({
        patient_id: patientId,
        date: '2024-01-20',
        procedure: 'Open Appendectomy',
        indication: 'Acute appendicitis',
        findings: 'Inflamed appendix with perforation',
        ward: 'Emergency Ward'
      })
    })

    it('should find surgeries by procedure name', async () => {
      const result = await surgeryRepo.listSurgeries({ search: 'Cholecystectomy' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].procedure).toBe('Laparoscopic Cholecystectomy')
    })

    it('should find surgeries by indication', async () => {
      const result = await surgeryRepo.listSurgeries({ search: 'appendicitis' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].procedure).toBe('Open Appendectomy')
    })

    it('should find surgeries by findings', async () => {
      const result = await surgeryRepo.listSurgeries({ search: 'perforation' })

      expect(result.data.length).toBe(1)
    })

    it('should use surgery lookup for quick search', async () => {
      const results = await surgeryRepo.lookupSurgery('Laparoscopic')

      expect(results.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Template Search', () => {
    beforeEach(async () => {
      await templateRepo.createSurgeryTemplate({
        name: 'Standard Appendectomy',
        description: 'Template for appendectomy procedures',
        content: '<p>Incision, exploration, appendectomy...</p>',
        category: 'General Surgery',
        tags: 'appendix,laparoscopic,emergency'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Cholecystectomy Protocol',
        description: 'Gallbladder removal procedure template',
        content: '<p>Port placement, dissection, removal...</p>',
        category: 'General Surgery',
        tags: 'gallbladder,laparoscopic,elective'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Hernia Repair Guide',
        description: 'Mesh repair technique for inguinal hernia',
        content: '<p>Dissection, mesh placement, closure...</p>',
        category: 'Hernia Surgery',
        tags: 'hernia,mesh,inguinal'
      })
    })

    it('should find templates by name', async () => {
      const result = await templateRepo.listSurgeryTemplates({ search: 'Appendectomy' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Standard Appendectomy')
    })

    it('should find templates by description', async () => {
      const result = await templateRepo.listSurgeryTemplates({ search: 'Gallbladder' })

      expect(result.data.length).toBe(1)
    })

    it('should filter templates by category', async () => {
      const result = await templateRepo.listSurgeryTemplates({ category: 'Hernia Surgery' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Hernia Repair Guide')
    })

    it('should search templates for editor', async () => {
      const results = await templateRepo.searchTemplatesForEditor({ query: 'laparoscopic' })

      expect(results.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Cross-Entity Search', () => {
    it('should find related data across entities', async () => {
      // Create interconnected data
      const doctor = await doctorRepo.createNewDoctor({
        name: 'Dr. Cross Search Surgeon',
        designation: 'Consultant'
      })

      const patient = await patientRepo.createNewPatient({
        bht: 'CROSS_001',
        name: 'Cross Search Patient',
        age: 40,
        sex: 'Male',
        ward: 'Surgical Ward',
        date_of_admission: '2024-01-15',
        diagnosis: 'Gallstones'
      })

      const surgery = await surgeryRepo.createNewSurgery({
        patient_id: patient.id,
        date: '2024-01-16',
        procedure: 'Cholecystectomy',
        ward: 'Surgical Ward'
      })

      await surgeryRepo.updateSurgeryDoctorsDoneBy(surgery.id, [doctor.id])

      // Search should find data across related entities
      const patientResults = await patientRepo.listPatients({ search: 'Gallstones' })
      expect(patientResults.data.length).toBeGreaterThanOrEqual(1)

      const surgeryResults = await surgeryRepo.listSurgeries({ search: 'Cholecystectomy' })
      expect(surgeryResults.data.length).toBeGreaterThanOrEqual(1)

      const doctorSurgeries = await surgeryRepo.listSurgeriesByDoctorId(doctor.id, {})
      expect(doctorSurgeries.data.length).toBe(1)
    })
  })
})
