import { sql } from 'kysely'
import { NewSurgery, Surgery, SurgeryUpdate } from '../../shared/types/db'
import { db } from '../db'
import { NewWithoutTimestamps, UpdateWithoutTimestamps, addTimestamps } from '../utils/sql'

export const createNewSurgery = async (surgery: NewWithoutTimestamps<NewSurgery>) => {
  const data = addTimestamps(surgery)
  return await db.insertInto('surgeries').values(data).returningAll().execute()
}

export const updateSurgery = async (
  id: number,
  surgery: UpdateWithoutTimestamps<SurgeryUpdate>
) => {
  const data = addTimestamps(surgery, false)

  return await db.updateTable('surgeries').set(data).where('id', '=', id).returningAll().execute()
}

export const updateSurgeryDoctorsDoneBy = async (surgeryId: number, doctorIds: number[]) => {
  const t = await db.transaction().execute(async (trx) => {
    await trx.deleteFrom('surgery_doctor_done_by').where('surgery_id', '=', surgeryId).execute()
    const result = await trx
      .insertInto('surgery_doctor_done_by')
      .values(doctorIds.map((doctorId) => ({ surgery_id: surgeryId, doctor_id: doctorId })))
      .returningAll()
      .execute()

    return result
  })

  return t
}

export const updateSurgeryDoctorsAssistedBy = async (surgeryId: number, doctorIds: number[]) => {
  const t = await db.transaction().execute(async (trx) => {
    await trx.deleteFrom('surgery_doctor_assisted_by').where('surgery_id', '=', surgeryId).execute()

    const result = await trx
      .insertInto('surgery_doctor_assisted_by')
      .values(doctorIds.map((doctorId) => ({ surgery_id: surgeryId, doctor_id: doctorId })))
      .returningAll()
      .execute()

    return result
  })

  return t
}

export const getSurgeryById = async (id: number) => {
  return await db.selectFrom('surgeries').where('id', '=', id).selectAll().executeTakeFirst()
}

export const getFollowUpsBySurgeryId = async (surgeryId: number) => {
  return await db
    .selectFrom('surgery_follow_ups')
    .where('surgery_id', '=', surgeryId)
    .orderBy('created_at', 'desc')
    .selectAll()
    .execute()
}

export const createNewFollowUp = async (surgeryId: number, notes: string) => {
  const data = addTimestamps({ notes, surgery_id: surgeryId })

  return await db.insertInto('surgery_follow_ups').values(data).returningAll().execute()
}

export const updateFollowUp = async (id: number, notes: string) => {
  const data = addTimestamps({ notes }, false)

  return await db
    .updateTable('surgery_follow_ups')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .execute()
}

export const lookupSurgery = async (search: string) => {
  // use a full text search to find the surgery by bht or phn or patient name
  // with sqlite fts5, we can use the match operator to search for the terms

  return await sql<Surgery[]>`
    SELECT surgeries.* FROM surgeries
    INNER JOIN patients_fts ON surgeries.patient_id = patients_fts.patient_id
    INNER JOIN surgeries_fts ON surgeries.id = surgeries_fts.surgery_id
    WHERE patients_fts MATCH ${search} OR surgeries_fts MATCH ${search}
    ORDER BY rank, surgeries.date DESC
  `.execute(db)
}

export interface SurgeryFilter {
  search?: string
  ward?: string
  start_date?: Date
  end_date?: Date
  patient_id?: number

  pageSize?: number
  page?: number
}

export const listSurgeries = async (filter: SurgeryFilter) => {
  const { search, ward, start_date, end_date, patient_id, pageSize = 50, page = 0 } = filter

  let query = db.selectFrom('surgeries').selectAll('surgeries')

  if (search) {
    query = query
      .leftJoin('patients_fts', 'patients_fts.patient_id', 'surgeries.patient_id')
      .leftJoin('surgeries_fts', 'surgeries_fts.surgery_id', 'surgeries.id')
      .where((eb) =>
        eb.or([
          sql<boolean>`patients_fts MATCH ${search}`,
          sql<boolean>`surgeries_fts MATCH ${search}`
        ])
      )
      .orderBy(sql`rank`, 'desc')
  }

  if (patient_id) {
    query = query.where('patient_id', '=', patient_id)
  }

  if (ward) {
    query = query.where('ward', '=', ward)
  }

  if (start_date) {
    query = query.where('surgeries.date', '>=', start_date)
  }

  if (end_date) {
    query = query.where('surgeries.date', '<=', end_date)
  }

  const surgeries = await query
    .orderBy('date', 'desc')
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

  return { data: surgeries, total, pages }
}
