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
import * as templateRepo from '../surgery-template'
import * as doctorRepo from '../doctor'

describe('Surgery Template Repository', () => {
  let testDb: Kysely<Database>
  let testDoctorId: number

  beforeAll(async () => {
    testDb = await createMigratedTestDb()
  })

  afterAll(async () => {
    await closeTestDb(testDb)
  })

  beforeEach(async () => {
    await cleanupTestDb(testDb)

    // Create a test doctor for doctor-specific templates
    const doctor = await doctorRepo.createNewDoctor({
      name: 'Dr. Template Test',
      designation: 'Surgeon'
    })
    testDoctorId = doctor.id
  })

  describe('createSurgeryTemplate', () => {
    it('should create a global template (no doctor)', async () => {
      const templateData = {
        name: 'Global Template',
        description: 'A global surgery template',
        content: '<p>Template content</p>',
        category: 'General Surgery',
        tags: 'general,template'
      }

      const result = await templateRepo.createSurgeryTemplate(templateData)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.name).toBe('Global Template')
      expect(result.doctor_id).toBeNull()
    })

    it('should create a doctor-specific template', async () => {
      const templateData = {
        name: 'Doctor Template',
        description: 'Doctor-specific template',
        content: '<p>Doctor template content</p>',
        category: 'Orthopedics',
        tags: 'orthopedic,personal',
        doctor_id: testDoctorId
      }

      const result = await templateRepo.createSurgeryTemplate(templateData)

      expect(result).toBeDefined()
      expect(result.doctor_id).toBe(testDoctorId)
    })
  })

  describe('getSurgeryTemplateById', () => {
    it('should return null for non-existent template', async () => {
      const result = await templateRepo.getSurgeryTemplateById(99999)
      expect(result).toBeNull()
    })

    it('should return template with correct data', async () => {
      const created = await templateRepo.createSurgeryTemplate({
        name: 'Test Template',
        description: 'Test Description',
        content: '<p>Test Content</p>',
        category: 'Test Category',
        tags: 'test,tags'
      })

      const template = await templateRepo.getSurgeryTemplateById(created.id)

      expect(template).not.toBeNull()
      expect(template?.name).toBe('Test Template')
      expect(template?.description).toBe('Test Description')
      expect(template?.content).toBe('<p>Test Content</p>')
      expect(template?.category).toBe('Test Category')
      expect(template?.tags).toBe('test,tags')
    })
  })

  describe('updateSurgeryTemplateById', () => {
    it('should update template data', async () => {
      const created = await templateRepo.createSurgeryTemplate({
        name: 'Original Name',
        description: 'Original Description',
        content: '<p>Original</p>',
        category: 'Original Category',
        tags: 'original'
      })

      const updated = await templateRepo.updateSurgeryTemplateById(created.id, {
        name: 'Updated Name',
        content: '<p>Updated Content</p>'
      })

      expect(updated).not.toBeNull()
      expect(updated?.name).toBe('Updated Name')
      expect(updated?.content).toBe('<p>Updated Content</p>')
      // Original values should remain
      expect(updated?.description).toBe('Original Description')
    })

    it('should return null when updating non-existent template', async () => {
      const result = await templateRepo.updateSurgeryTemplateById(99999, { name: 'Test' })
      expect(result).toBeNull()
    })
  })

  describe('deleteSurgeryTemplateById', () => {
    it('should delete an existing template', async () => {
      const created = await templateRepo.createSurgeryTemplate({
        name: 'To Delete',
        description: 'Will be deleted',
        content: '<p>Delete me</p>',
        category: 'Test',
        tags: 'delete'
      })

      const deleteResult = await templateRepo.deleteSurgeryTemplateById(created.id)
      expect(deleteResult).toBeDefined()

      const template = await templateRepo.getSurgeryTemplateById(created.id)
      expect(template).toBeNull()
    })
  })

  describe('listSurgeryTemplates', () => {
    it('should return empty list when no templates exist', async () => {
      const result = await templateRepo.listSurgeryTemplates({})

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
      expect(result.pages).toBe(0)
    })

    it('should return paginated list of templates', async () => {
      for (let i = 1; i <= 15; i++) {
        await templateRepo.createSurgeryTemplate({
          name: `Template ${i}`,
          description: `Description ${i}`,
          content: `<p>Content ${i}</p>`,
          category: 'General',
          tags: 'test'
        })
      }

      const result = await templateRepo.listSurgeryTemplates({ pageSize: 10, page: 1 })

      expect(result.data.length).toBe(10)
      expect(result.total).toBe(15)
      expect(result.pages).toBe(2)
    })

    it('should filter templates by category', async () => {
      await templateRepo.createSurgeryTemplate({
        name: 'General Template',
        description: 'General',
        content: '<p>General</p>',
        category: 'General Surgery',
        tags: 'general'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Ortho Template',
        description: 'Ortho',
        content: '<p>Ortho</p>',
        category: 'Orthopedics',
        tags: 'ortho'
      })

      const result = await templateRepo.listSurgeryTemplates({ category: 'Orthopedics' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Ortho Template')
    })

    it('should filter by doctor and include global templates', async () => {
      // Create global template
      await templateRepo.createSurgeryTemplate({
        name: 'Global Template',
        description: 'Global',
        content: '<p>Global</p>',
        category: 'General',
        tags: 'global'
      })

      // Create doctor-specific template
      await templateRepo.createSurgeryTemplate({
        name: 'Doctor Template',
        description: 'Doctor',
        content: '<p>Doctor</p>',
        category: 'General',
        tags: 'doctor',
        doctor_id: testDoctorId
      })

      const result = await templateRepo.listSurgeryTemplates({
        doctorId: testDoctorId,
        includeGlobal: true
      })

      expect(result.data.length).toBe(2)
    })

    it('should filter by doctor only (exclude global)', async () => {
      await templateRepo.createSurgeryTemplate({
        name: 'Global Template',
        description: 'Global',
        content: '<p>Global</p>',
        category: 'General',
        tags: 'global'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Doctor Template',
        description: 'Doctor',
        content: '<p>Doctor</p>',
        category: 'General',
        tags: 'doctor',
        doctor_id: testDoctorId
      })

      const result = await templateRepo.listSurgeryTemplates({
        doctorId: testDoctorId,
        includeGlobal: false
      })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Doctor Template')
    })

    it('should filter templates by search term', async () => {
      await templateRepo.createSurgeryTemplate({
        name: 'Appendectomy Template',
        description: 'For appendectomy procedures',
        content: '<p>Appendectomy</p>',
        category: 'General Surgery',
        tags: 'appendix'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Cholecystectomy Template',
        description: 'For gallbladder removal',
        content: '<p>Cholecystectomy</p>',
        category: 'General Surgery',
        tags: 'gallbladder'
      })

      const result = await templateRepo.listSurgeryTemplates({ search: 'appendectomy' })

      expect(result.data.length).toBe(1)
      expect(result.data[0].name).toBe('Appendectomy Template')
    })
  })

  describe('searchTemplatesForEditor', () => {
    it('should return templates formatted for editor', async () => {
      await templateRepo.createSurgeryTemplate({
        name: 'Editor Template',
        description: 'For editor popup',
        content: '<p>Editor content</p>',
        category: 'General',
        tags: 'editor,popup'
      })

      const result = await templateRepo.searchTemplatesForEditor({ query: 'editor' })

      expect(result.length).toBe(1)
      expect(result[0].name).toBe('Editor Template')
      expect(result[0].tags).toEqual(['editor', 'popup'])
    })
  })

  describe('getTemplateCategories', () => {
    it('should return distinct categories', async () => {
      await templateRepo.createSurgeryTemplate({
        name: 'Template 1',
        description: 'Test',
        content: '<p>Test</p>',
        category: 'General Surgery',
        tags: 'test'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Template 2',
        description: 'Test',
        content: '<p>Test</p>',
        category: 'Orthopedics',
        tags: 'test'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Template 3',
        description: 'Test',
        content: '<p>Test</p>',
        category: 'General Surgery',
        tags: 'test'
      })

      const categories = await templateRepo.getTemplateCategories()

      expect(categories).toContain('General Surgery')
      expect(categories).toContain('Orthopedics')
      expect(categories.length).toBe(2)
    })
  })

  describe('getTemplateTags', () => {
    it('should return all distinct tags', async () => {
      await templateRepo.createSurgeryTemplate({
        name: 'Template 1',
        description: 'Test',
        content: '<p>Test</p>',
        category: 'General',
        tags: 'surgery,general'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Template 2',
        description: 'Test',
        content: '<p>Test</p>',
        category: 'General',
        tags: 'surgery,ortho'
      })

      const tags = await templateRepo.getTemplateTags()

      expect(tags).toContain('surgery')
      expect(tags).toContain('general')
      expect(tags).toContain('ortho')
    })
  })
})
