import { db } from '../db'
import { addTimestamps } from '../utils/sql'
import {
  PrintTemplate,
  NewPrintTemplate,
  PrintTemplateUpdate,
  PrintTemplateFilter,
  TemplateStructure,
  PageSettings,
  TemplateType,
  DefaultPrintTemplate
} from '../../shared/types/template-blocks'

// Helper to parse JSON fields safely
const parseJson = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// Convert database row to PrintTemplate
const rowToTemplate = (row: {
  id: number
  name: string
  type: string
  description: string | null
  structure: string
  page_settings: string | null
  is_default: number
  created_at: Date
  updated_at: Date
}): PrintTemplate => ({
  id: row.id,
  name: row.name,
  type: row.type as TemplateType,
  description: row.description,
  structure: parseJson<TemplateStructure>(row.structure, { version: 1, blocks: [] }),
  pageSettings: parseJson<PageSettings | null>(row.page_settings, null),
  isDefault: row.is_default === 1,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at)
})

export const createPrintTemplate = async (template: NewPrintTemplate): Promise<PrintTemplate> => {
  const data = addTimestamps({
    name: template.name,
    type: template.type,
    description: template.description ?? null,
    structure: JSON.stringify(template.structure),
    page_settings: template.pageSettings ? JSON.stringify(template.pageSettings) : null,
    is_default: template.isDefault ? 1 : 0
  })

  // If setting as default, clear other defaults for this type first
  if (template.isDefault) {
    await db
      .updateTable('print_templates')
      .set({ is_default: 0 })
      .where('type', '=', template.type)
      .execute()
  }

  const result = await db
    .insertInto('print_templates')
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow()

  return rowToTemplate(result)
}

export const getPrintTemplateById = async (id: number): Promise<PrintTemplate | null> => {
  const result = await db
    .selectFrom('print_templates')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()

  if (!result) return null
  return rowToTemplate(result)
}

export const getDefaultPrintTemplate = async (type: TemplateType): Promise<PrintTemplate | null> => {
  const result = await db
    .selectFrom('print_templates')
    .where('type', '=', type)
    .where('is_default', '=', 1)
    .selectAll()
    .executeTakeFirst()

  if (!result) return null
  return rowToTemplate(result)
}

export const updatePrintTemplateById = async (
  id: number,
  update: PrintTemplateUpdate
): Promise<PrintTemplate | null> => {
  const updateData: Record<string, unknown> = {
    updated_at: Date.now()
  }

  if (update.name !== undefined) {
    updateData.name = update.name
  }
  if (update.description !== undefined) {
    updateData.description = update.description
  }
  if (update.structure !== undefined) {
    updateData.structure = JSON.stringify(update.structure)
  }
  if (update.pageSettings !== undefined) {
    updateData.page_settings = update.pageSettings ? JSON.stringify(update.pageSettings) : null
  }
  if (update.isDefault !== undefined) {
    updateData.is_default = update.isDefault ? 1 : 0

    // If setting as default, get the template's type first
    if (update.isDefault) {
      const existing = await db
        .selectFrom('print_templates')
        .where('id', '=', id)
        .select('type')
        .executeTakeFirst()

      if (existing) {
        // Clear other defaults for this type
        await db
          .updateTable('print_templates')
          .set({ is_default: 0 })
          .where('type', '=', existing.type)
          .where('id', '!=', id)
          .execute()
      }
    }
  }

  const result = await db
    .updateTable('print_templates')
    .set(updateData)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()

  if (!result) return null
  return rowToTemplate(result)
}

export const deletePrintTemplateById = async (id: number): Promise<boolean> => {
  const result = await db.deleteFrom('print_templates').where('id', '=', id).execute()
  return result.length > 0 && Number(result[0].numDeletedRows) > 0
}

export const listPrintTemplates = async (
  filter: PrintTemplateFilter = {}
): Promise<{ data: PrintTemplate[]; total: number }> => {
  let query = db.selectFrom('print_templates')

  if (filter.type) {
    query = query.where('type', '=', filter.type)
  }

  if (filter.search) {
    const searchTerm = `%${filter.search}%`
    query = query.where((eb) =>
      eb.or([eb('name', 'like', searchTerm), eb('description', 'like', searchTerm)])
    )
  }

  const templates = await query.orderBy('is_default', 'desc').orderBy('name', 'asc').selectAll().execute()

  const data = templates.map(rowToTemplate)

  return { data, total: data.length }
}

export const duplicatePrintTemplate = async (
  id: number,
  newName: string
): Promise<PrintTemplate | null> => {
  const original = await getPrintTemplateById(id)
  if (!original) return null

  return createPrintTemplate({
    name: newName,
    type: original.type,
    description: original.description,
    structure: original.structure,
    pageSettings: original.pageSettings,
    isDefault: false // Duplicates are never default
  })
}

export const setDefaultPrintTemplate = async (
  id: number,
  type: TemplateType
): Promise<boolean> => {
  // Clear existing default for this type
  await db.updateTable('print_templates').set({ is_default: 0 }).where('type', '=', type).execute()

  // Set new default
  const result = await db
    .updateTable('print_templates')
    .set({ is_default: 1, updated_at: Date.now() })
    .where('id', '=', id)
    .where('type', '=', type)
    .execute()

  return result.length > 0 && Number(result[0].numChangedRows) > 0
}

// ============================================================
// Default Print Templates (read-only reference templates)
// ============================================================

// Convert database row to DefaultPrintTemplate
const rowToDefaultTemplate = (row: {
  id: number
  key: string
  name: string
  type: string
  description: string | null
  structure: string
  page_settings: string | null
}): DefaultPrintTemplate => ({
  id: row.id,
  key: row.key,
  name: row.name,
  type: row.type as TemplateType,
  description: row.description,
  structure: parseJson<TemplateStructure>(row.structure, { version: 1, blocks: [] }),
  pageSettings: parseJson<PageSettings | null>(row.page_settings, null)
})

export const listDefaultPrintTemplates = async (
  type?: TemplateType
): Promise<DefaultPrintTemplate[]> => {
  let query = db.selectFrom('default_print_templates')

  if (type) {
    query = query.where('type', '=', type)
  }

  const results = await query.orderBy('name', 'asc').selectAll().execute()
  return results.map(rowToDefaultTemplate)
}

export const getDefaultPrintTemplateByKey = async (
  key: string
): Promise<DefaultPrintTemplate | null> => {
  const result = await db
    .selectFrom('default_print_templates')
    .where('key', '=', key)
    .selectAll()
    .executeTakeFirst()

  if (!result) return null
  return rowToDefaultTemplate(result)
}

// Restore a print template from a default template
// Creates a new template based on the default, optionally setting it as the default
export const restorePrintTemplateFromDefault = async (
  defaultKey: string,
  options: { setAsDefault?: boolean; customName?: string } = {}
): Promise<PrintTemplate | null> => {
  const defaultTemplate = await getDefaultPrintTemplateByKey(defaultKey)
  if (!defaultTemplate) return null

  const name = options.customName || defaultTemplate.name

  return createPrintTemplate({
    name,
    type: defaultTemplate.type,
    description: defaultTemplate.description,
    structure: defaultTemplate.structure,
    pageSettings: defaultTemplate.pageSettings,
    isDefault: options.setAsDefault ?? false
  })
}

// Reset all print templates to defaults
// Deletes ALL existing templates and recreates from default templates
export const resetPrintTemplatesToDefaults = async (): Promise<PrintTemplate[]> => {
  // Delete all existing print templates
  await db.deleteFrom('print_templates').execute()

  // Get all default templates
  const defaults = await listDefaultPrintTemplates()

  // Track which types we've seen to set first of each type as default
  const seenTypes = new Set<TemplateType>()

  // Create templates from each default
  const created: PrintTemplate[] = []
  for (const defaultTemplate of defaults) {
    const isFirstOfType = !seenTypes.has(defaultTemplate.type)
    seenTypes.add(defaultTemplate.type)

    const template = await createPrintTemplate({
      name: defaultTemplate.name,
      type: defaultTemplate.type,
      description: defaultTemplate.description,
      structure: defaultTemplate.structure,
      pageSettings: defaultTemplate.pageSettings,
      isDefault: isFirstOfType
    })

    created.push(template)
  }

  return created
}
