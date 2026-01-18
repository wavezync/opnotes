import { db } from '../db'
import { ActivityLogFilter } from '../../shared/types/api'

export type EntityType = 'patient' | 'surgery' | 'followup' | 'doctor'
export type ActionType = 'created' | 'updated' | 'deleted'

export interface ActivityLogEntry {
  entityType: EntityType
  entityId: number
  action: ActionType
  title: string
  description?: string
  patientId?: number
  surgeryId?: number
}

export interface ActivityLogItem {
  id: number
  entityType: EntityType
  entityId: number
  action: ActionType
  title: string
  description: string | null
  patientId: number | null
  surgeryId: number | null
  createdAt: string
}

/**
 * Log an activity to the activity log
 */
export async function logActivity(entry: ActivityLogEntry): Promise<void> {
  await db
    .insertInto('activity_log')
    .values({
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      action: entry.action,
      title: entry.title,
      description: entry.description ?? null,
      patient_id: entry.patientId ?? null,
      surgery_id: entry.surgeryId ?? null,
      created_at: Date.now()
    })
    .execute()
}

/**
 * Get recent activities with pagination
 */
export async function getRecentActivities(limit: number = 10): Promise<ActivityLogItem[]> {
  const results = await db
    .selectFrom('activity_log')
    .selectAll()
    .orderBy('created_at', 'desc')
    .limit(limit)
    .execute()

  return results.map((row) => ({
    id: row.id,
    entityType: row.entity_type as EntityType,
    entityId: row.entity_id,
    action: row.action as ActionType,
    title: row.title,
    description: row.description,
    patientId: row.patient_id,
    surgeryId: row.surgery_id,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at as number).toISOString()
  }))
}

/**
 * Get activities for a specific entity
 */
export async function getActivitiesForEntity(
  entityType: EntityType,
  entityId: number,
  limit: number = 20
): Promise<ActivityLogItem[]> {
  const results = await db
    .selectFrom('activity_log')
    .selectAll()
    .where('entity_type', '=', entityType)
    .where('entity_id', '=', entityId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .execute()

  return results.map((row) => ({
    id: row.id,
    entityType: row.entity_type as EntityType,
    entityId: row.entity_id,
    action: row.action as ActionType,
    title: row.title,
    description: row.description,
    patientId: row.patient_id,
    surgeryId: row.surgery_id,
    createdAt: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : new Date(row.created_at as number).toISOString()
  }))
}

/**
 * List activity log entries with filtering and pagination
 */
export async function listActivityLog(
  filter: ActivityLogFilter = {}
): Promise<{ data: ActivityLogItem[]; total: number }> {
  const { entityType, action, search, startDate, endDate, page = 0, pageSize = 10 } = filter

  let query = db.selectFrom('activity_log')
  let countQuery = db.selectFrom('activity_log')

  // Apply entity type filter
  if (entityType) {
    query = query.where('entity_type', '=', entityType)
    countQuery = countQuery.where('entity_type', '=', entityType)
  }

  // Apply action filter
  if (action) {
    query = query.where('action', '=', action)
    countQuery = countQuery.where('action', '=', action)
  }

  // Apply search filter (searches title and description)
  if (search) {
    const searchPattern = `%${search}%`
    query = query.where((eb) =>
      eb.or([eb('title', 'like', searchPattern), eb('description', 'like', searchPattern)])
    )
    countQuery = countQuery.where((eb) =>
      eb.or([eb('title', 'like', searchPattern), eb('description', 'like', searchPattern)])
    )
  }

  // Apply date range filter (convert timestamps to Date objects for comparison)
  if (startDate) {
    const startDateObj = new Date(startDate)
    query = query.where('created_at', '>=', startDateObj)
    countQuery = countQuery.where('created_at', '>=', startDateObj)
  }

  if (endDate) {
    const endDateObj = new Date(endDate)
    query = query.where('created_at', '<=', endDateObj)
    countQuery = countQuery.where('created_at', '<=', endDateObj)
  }

  // Get total count
  const countResult = await countQuery
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .executeTakeFirst()
  const total = countResult?.count ?? 0

  // Get paginated results
  const results = await query
    .selectAll()
    .orderBy('created_at', 'desc')
    .limit(pageSize)
    .offset(page * pageSize)
    .execute()

  const data = results.map((row) => ({
    id: row.id,
    entityType: row.entity_type as EntityType,
    entityId: row.entity_id,
    action: row.action as ActionType,
    title: row.title,
    description: row.description,
    patientId: row.patient_id,
    surgeryId: row.surgery_id,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at as number).toISOString()
  }))

  return { data, total }
}
