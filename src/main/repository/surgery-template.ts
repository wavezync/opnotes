import { sql } from 'kysely'
import { NewSurgeryTemplate, SurgeryTemplateUpdate } from '../../shared/types/db'
import { db } from '../db'
import { SurgeryTemplateFilter } from '../../shared/types/api'
import { SurgeryTemplateModel } from '../../shared/models/SurgeryTemplateModel'
import { NewWithoutTimestamps, addTimestamps } from '../utils/sql'

export const createSurgeryTemplate = async (template: NewWithoutTimestamps<NewSurgeryTemplate>) => {
  const data = addTimestamps(template)
  const result = await db
    .insertInto('surgery_templates')
    .values(data)
    .returningAll()
    .executeTakeFirst()

  if (result) {
    return new SurgeryTemplateModel(result)
  }

  throw new Error('Failed to create surgery template')
}

export const getSurgeryTemplateById = async (id: number) => {
  const result = await db
    .selectFrom('surgery_templates')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()

  if (result) {
    return new SurgeryTemplateModel(result)
  }

  return null
}

export const updateSurgeryTemplateById = async (id: number, template: SurgeryTemplateUpdate) => {
  const data = addTimestamps(template, {
    createdAt: false,
    updatedAt: true
  })
  const updated = await db
    .updateTable('surgery_templates')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()

  if (updated) {
    return new SurgeryTemplateModel(updated)
  }

  return null
}

export const deleteSurgeryTemplateById = async (id: number) => {
  return await db.deleteFrom('surgery_templates').where('id', '=', id).execute()
}

export const listSurgeryTemplates = async (filter: SurgeryTemplateFilter) => {
  const { search, category, doctorId, includeGlobal = true, pageSize = 50, page = 0 } = filter

  let query = db.selectFrom('surgery_templates').selectAll('surgery_templates')

  // FTS search
  if (search) {
    const term = `${search}*`
    query = query
      .innerJoin(
        'surgery_templates_fts',
        'surgery_templates.id',
        'surgery_templates_fts.template_id'
      )
      .where(sql<boolean>`surgery_templates_fts MATCH ${term}`)
      .orderBy(sql`rank`, 'desc')
  }

  // Doctor filter (global + doctor-specific)
  if (doctorId !== undefined) {
    if (doctorId === null) {
      // Only global templates
      query = query.where('doctor_id', 'is', null)
    } else if (includeGlobal) {
      // Both global and doctor-specific
      query = query.where((eb) =>
        eb.or([eb('doctor_id', 'is', null), eb('doctor_id', '=', doctorId)])
      )
    } else {
      // Only doctor-specific
      query = query.where('doctor_id', '=', doctorId)
    }
  }

  if (category) {
    query = query.where('surgery_templates.category', '=', category)
  }

  const templateResult = await query
    .orderBy('surgery_templates.category')
    .orderBy('surgery_templates.title')
    .limit(pageSize)
    .offset(page * pageSize)
    .execute()

  const totalResult = await query
    .clearSelect()
    .clearOrderBy()
    .clearLimit()
    .clearOffset()
    .select((eb) => eb.fn.countAll<number>().as('total'))
    .executeTakeFirst()

  const total = totalResult?.total ?? 0
  const pages = Math.ceil(total / pageSize)
  const templates = templateResult.map((t) => new SurgeryTemplateModel(t))

  return { data: templates, total, pages }
}

// Template item type for editor popup
export interface EditorTemplateItem {
  id: number
  title: string
  content: string
  category: string
  tags: string[]
  doctorId: number | null
  doctorName: string | null
}

// For editor popup - search templates with FTS and filters
export const searchTemplatesForEditor = async (params: {
  search?: string
  doctorId?: number
  category?: string
  tag?: string
}): Promise<EditorTemplateItem[]> => {
  const { search, doctorId, category, tag } = params

  let query = db
    .selectFrom('surgery_templates')
    .leftJoin('doctors', 'surgery_templates.doctor_id', 'doctors.id')
    .select([
      'surgery_templates.id',
      'surgery_templates.title',
      'surgery_templates.content',
      'surgery_templates.category',
      'surgery_templates.tags',
      'surgery_templates.doctor_id',
      'surgery_templates.created_at',
      'surgery_templates.updated_at',
      'doctors.name as doctor_name'
    ])

  // FTS search
  if (search) {
    const term = `${search}*`
    query = query
      .innerJoin(
        'surgery_templates_fts',
        'surgery_templates.id',
        'surgery_templates_fts.template_id'
      )
      .where(sql<boolean>`surgery_templates_fts MATCH ${term}`)
      .orderBy(sql`rank`, 'desc')
  }

  // Include global templates and optionally filter by doctor
  if (doctorId !== undefined) {
    query = query.where((eb) =>
      eb.or([
        eb('surgery_templates.doctor_id', 'is', null),
        eb('surgery_templates.doctor_id', '=', doctorId)
      ])
    )
  }

  // Category filter
  if (category) {
    query = query.where('surgery_templates.category', '=', category)
  }

  const results = await query
    .orderBy('surgery_templates.category')
    .orderBy('surgery_templates.title')
    .execute()

  // Map to flat array with parsed tags
  let templates: EditorTemplateItem[] = results.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags ? JSON.parse(row.tags) : [],
    doctorId: row.doctor_id,
    doctorName: row.doctor_name ?? null
  }))

  // Filter by tag (done in JS since tags are stored as JSON)
  if (tag) {
    templates = templates.filter((t) => t.tags.includes(tag))
  }

  return templates
}

// Get all distinct categories
export const getTemplateCategories = async () => {
  const results = await db
    .selectFrom('surgery_templates')
    .select('category')
    .distinct()
    .orderBy('category')
    .execute()

  return results.map((r) => r.category)
}

// Get all distinct tags across all templates
export const getTemplateTags = async () => {
  const results = await db.selectFrom('surgery_templates').select('tags').execute()

  const allTags = new Set<string>()
  for (const row of results) {
    if (row.tags) {
      const tags = JSON.parse(row.tags) as string[]
      for (const tag of tags) {
        allTags.add(tag)
      }
    }
  }

  return Array.from(allTags).sort()
}
