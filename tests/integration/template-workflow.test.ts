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
import * as templateRepo from '../../src/main/repository/surgery-template'
import * as doctorRepo from '../../src/main/repository/doctor'

describe('Template Workflow Integration', () => {
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

  describe('Template Organization', () => {
    it('should organize templates by category', async () => {
      // Create templates in different categories
      const categories = [
        'General Surgery',
        'Orthopedics',
        'Cardiovascular',
        'Neurosurgery',
        'General Surgery' // Duplicate to test grouping
      ]

      for (let i = 0; i < categories.length; i++) {
        await templateRepo.createSurgeryTemplate({
          name: `Template ${i + 1}`,
          description: `Description for ${categories[i]}`,
          content: `<p>Content for template ${i + 1}</p>`,
          category: categories[i],
          tags: 'test'
        })
      }

      // Get all categories
      const uniqueCategories = await templateRepo.getTemplateCategories()

      expect(uniqueCategories.length).toBe(4)
      expect(uniqueCategories).toContain('General Surgery')
      expect(uniqueCategories).toContain('Orthopedics')
      expect(uniqueCategories).toContain('Cardiovascular')
      expect(uniqueCategories).toContain('Neurosurgery')

      // Filter by category
      const generalSurgery = await templateRepo.listSurgeryTemplates({
        category: 'General Surgery'
      })

      expect(generalSurgery.data.length).toBe(2)
    })

    it('should track and retrieve tags', async () => {
      await templateRepo.createSurgeryTemplate({
        name: 'Tagged Template 1',
        description: 'Template with multiple tags',
        content: '<p>Content</p>',
        category: 'General',
        tags: 'laparoscopic,minimally-invasive,elective'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Tagged Template 2',
        description: 'Another template',
        content: '<p>Content</p>',
        category: 'General',
        tags: 'open,emergency,laparoscopic'
      })

      const allTags = await templateRepo.getTemplateTags()

      expect(allTags).toContain('laparoscopic')
      expect(allTags).toContain('minimally-invasive')
      expect(allTags).toContain('elective')
      expect(allTags).toContain('open')
      expect(allTags).toContain('emergency')
    })
  })

  describe('Doctor-Specific Templates', () => {
    let doctor1Id: number
    let doctor2Id: number

    beforeEach(async () => {
      const doctor1 = await doctorRepo.createNewDoctor({
        name: 'Dr. Template Creator',
        designation: 'Consultant'
      })
      doctor1Id = doctor1.id

      const doctor2 = await doctorRepo.createNewDoctor({
        name: 'Dr. Another Surgeon',
        designation: 'Senior Registrar'
      })
      doctor2Id = doctor2.id
    })

    it('should create and retrieve doctor-specific templates', async () => {
      // Create a global template
      await templateRepo.createSurgeryTemplate({
        name: 'Global Template',
        description: 'Available to all',
        content: '<p>Global content</p>',
        category: 'General',
        tags: 'global'
      })

      // Create doctor-specific templates
      await templateRepo.createSurgeryTemplate({
        name: 'Doctor 1 Template',
        description: 'Personal template for Doctor 1',
        content: '<p>Doctor 1 specific content</p>',
        category: 'General',
        tags: 'personal',
        doctor_id: doctor1Id
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Doctor 2 Template',
        description: 'Personal template for Doctor 2',
        content: '<p>Doctor 2 specific content</p>',
        category: 'General',
        tags: 'personal',
        doctor_id: doctor2Id
      })

      // Doctor 1 should see their template and global templates
      const doctor1Templates = await templateRepo.listSurgeryTemplates({
        doctorId: doctor1Id,
        includeGlobal: true
      })

      expect(doctor1Templates.data.length).toBe(2)
      const doctor1Names = doctor1Templates.data.map((t) => t.name)
      expect(doctor1Names).toContain('Global Template')
      expect(doctor1Names).toContain('Doctor 1 Template')
      expect(doctor1Names).not.toContain('Doctor 2 Template')

      // Doctor 1 only (no global)
      const doctor1Only = await templateRepo.listSurgeryTemplates({
        doctorId: doctor1Id,
        includeGlobal: false
      })

      expect(doctor1Only.data.length).toBe(1)
      expect(doctor1Only.data[0].name).toBe('Doctor 1 Template')
    })

    it('should handle template ownership correctly', async () => {
      const personalTemplate = await templateRepo.createSurgeryTemplate({
        name: 'Personal Template',
        description: 'Doctor 1 owns this',
        content: '<p>Content</p>',
        category: 'General',
        tags: 'personal',
        doctor_id: doctor1Id
      })

      // Verify ownership
      const template = await templateRepo.getSurgeryTemplateById(personalTemplate.id)
      expect(template?.doctor_id).toBe(doctor1Id)

      // Update should preserve ownership
      await templateRepo.updateSurgeryTemplateById(personalTemplate.id, {
        name: 'Updated Personal Template'
      })

      const updatedTemplate = await templateRepo.getSurgeryTemplateById(personalTemplate.id)
      expect(updatedTemplate?.doctor_id).toBe(doctor1Id)
      expect(updatedTemplate?.name).toBe('Updated Personal Template')
    })
  })

  describe('Template for Editor Integration', () => {
    beforeEach(async () => {
      // Create templates for editor testing
      await templateRepo.createSurgeryTemplate({
        name: 'Appendectomy Standard',
        description: 'Standard appendectomy procedure',
        content: '<p><strong>Procedure:</strong> Laparoscopic appendectomy</p>',
        category: 'General Surgery',
        tags: 'appendix,laparoscopic,standard'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Cholecystectomy Protocol',
        description: 'Gallbladder removal',
        content: '<p><strong>Procedure:</strong> Laparoscopic cholecystectomy</p>',
        category: 'General Surgery',
        tags: 'gallbladder,laparoscopic,elective'
      })

      await templateRepo.createSurgeryTemplate({
        name: 'Emergency Laparotomy',
        description: 'Emergency exploratory surgery',
        content: '<p><strong>Emergency procedure</strong></p>',
        category: 'Emergency Surgery',
        tags: 'emergency,open,exploratory'
      })
    })

    it('should search templates for editor with parsed tags', async () => {
      const results = await templateRepo.searchTemplatesForEditor({ query: 'laparoscopic' })

      expect(results.length).toBe(2)

      // Tags should be parsed into arrays
      results.forEach((template) => {
        expect(Array.isArray(template.tags)).toBe(true)
        expect(template.tags.length).toBeGreaterThan(0)
      })
    })

    it('should return template content for insertion', async () => {
      const results = await templateRepo.searchTemplatesForEditor({ query: 'Appendectomy' })

      expect(results.length).toBe(1)
      expect(results[0].content).toContain('Laparoscopic appendectomy')
    })

    it('should limit search results appropriately', async () => {
      // Create many templates
      for (let i = 0; i < 20; i++) {
        await templateRepo.createSurgeryTemplate({
          name: `Template ${i}`,
          description: 'Searchable template',
          content: '<p>Content</p>',
          category: 'General',
          tags: 'searchable,test'
        })
      }

      const results = await templateRepo.searchTemplatesForEditor({
        query: 'searchable',
        limit: 5
      })

      expect(results.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Template Lifecycle', () => {
    it('should handle complete template lifecycle', async () => {
      // Create
      const created = await templateRepo.createSurgeryTemplate({
        name: 'Lifecycle Template',
        description: 'Testing lifecycle',
        content: '<p>Initial content</p>',
        category: 'Test',
        tags: 'lifecycle,test'
      })

      expect(created.id).toBeDefined()
      expect(created.name).toBe('Lifecycle Template')

      // Read
      const retrieved = await templateRepo.getSurgeryTemplateById(created.id)
      expect(retrieved).not.toBeNull()
      expect(retrieved?.description).toBe('Testing lifecycle')

      // Update
      const updated = await templateRepo.updateSurgeryTemplateById(created.id, {
        content: '<p>Updated content with more details</p>',
        tags: 'lifecycle,test,updated'
      })

      expect(updated?.content).toContain('Updated content')
      expect(updated?.tags).toContain('updated')

      // List
      const listed = await templateRepo.listSurgeryTemplates({ search: 'Lifecycle' })
      expect(listed.data.length).toBe(1)

      // Delete
      await templateRepo.deleteSurgeryTemplateById(created.id)

      // Verify deletion
      const deleted = await templateRepo.getSurgeryTemplateById(created.id)
      expect(deleted).toBeNull()

      const listedAfterDelete = await templateRepo.listSurgeryTemplates({ search: 'Lifecycle' })
      expect(listedAfterDelete.data.length).toBe(0)
    })
  })
})
