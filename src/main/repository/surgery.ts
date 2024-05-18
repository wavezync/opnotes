import { sql } from 'kysely'
import { NewSurgery, SurgeryUpdate } from '../../shared/types/db'
import { db } from '../db'
import { NewWithoutTimestamps, UpdateWithoutTimestamps, addTimestamps } from '../utils/sql'
import { SurgeryFilter } from '../../shared/types/api'
import { SurgeryModel } from '../../shared/models/SurgeryModel'
import { DoctorModel } from '../../shared/models/DoctorModel'

export const createNewSurgery = async (surgery: NewWithoutTimestamps<NewSurgery>) => {
  const data = addTimestamps(surgery)
  return await db.insertInto('surgeries').values(data).returningAll().executeTakeFirst()
}

export const updateSurgery = async (
  id: number,
  surgery: UpdateWithoutTimestamps<SurgeryUpdate>
) => {
  const data = addTimestamps(surgery, false)

  return await db
    .updateTable('surgeries')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()
}

export const updateSurgeryDoctorsDoneBy = async (surgeryId: number, doctorIds: number[]) => {
  const t = await db.transaction().execute(async (trx) => {
    await trx.deleteFrom('surgery_doctors_done_by').where('surgery_id', '=', surgeryId).execute()
    const result = await trx
      .insertInto('surgery_doctors_done_by')
      .values(doctorIds.map((doctorId) => ({ surgery_id: surgeryId, doctor_id: doctorId })))
      .returningAll()
      .execute()

    return result
  })

  return t
}

export const updateSurgeryDoctorsAssistedBy = async (surgeryId: number, doctorIds: number[]) => {
  const t = await db.transaction().execute(async (trx) => {
    await trx
      .deleteFrom('surgery_doctors_assisted_by')
      .where('surgery_id', '=', surgeryId)
      .execute()

    const result = await trx
      .insertInto('surgery_doctors_assisted_by')
      .values(doctorIds.map((doctorId) => ({ surgery_id: surgeryId, doctor_id: doctorId })))
      .returningAll()
      .execute()

    return result
  })

  return t
}

export const getSurgeryById = async (id: number) => {
  const surgery = await db
    .selectFrom('surgeries')
    .where('id', '=', id)
    .selectAll()
    .executeTakeFirst()

  if (!surgery) {
    return null
  }

  const doneBy = await db
    .selectFrom('surgery_doctors_done_by')
    .where('surgery_id', '=', id)
    .select('doctor_id')
    .execute()

  const assistedBy = await db
    .selectFrom('surgery_doctors_assisted_by')
    .where('surgery_id', '=', id)
    .select('doctor_id')
    .execute()

  const doctorIds = [
    ...new Set([...doneBy.map((row) => row.doctor_id), ...assistedBy.map((row) => row.doctor_id)])
  ]

  const doctors = await db.selectFrom('doctors').where('id', 'in', doctorIds).selectAll().execute()

  const doneByDoctors = doctors.filter((doctor) =>
    doneBy.some((row) => row.doctor_id === doctor.id)
  )

  const assistedByDoctors = doctors.filter((doctor) =>
    assistedBy.some((row) => row.doctor_id === doctor.id)
  )

  const surgeryModel = new SurgeryModel(surgery)
  surgeryModel.doneBy = doneByDoctors.map((doctor) => new DoctorModel(doctor))
  surgeryModel.assistedBy = assistedByDoctors.map((doctor) => new DoctorModel(doctor))

  return surgeryModel
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

  return await db
    .selectFrom('surgeries')
    .selectAll('surgeries')
    .leftJoin('surgeries_fts', 'surgeries_fts.surgery_id', 'surgeries.id')
    .leftJoin('patients_fts', 'patients_fts.patient_id', 'surgeries.patient_id')
    .where((eb) =>
      eb.or([
        sql<boolean>`surgeries_fts MATCH ${search}`,
        sql<boolean>`patients_fts MATCH ${search}`
      ])
    )

    .orderBy(sql`rank`, 'desc')
    .execute()
}

export const listSurgeries = async (filter: SurgeryFilter) => {
  const { search, ward, start_date, end_date, patient_id, pageSize = 50, page = 0 } = filter

  let query = db.selectFrom('surgeries').selectAll('surgeries')

  if (search) {
    const term = `${search}*`
    query = query
      .leftJoin(
        (eb) =>
          eb
            .selectFrom('surgeries_fts')
            .select(['surgeries_fts.surgery_id', sql<number>`rank`.as('rank')])
            .where(sql<boolean>`surgeries_fts MATCH ${term}`)

            .as('matching_patients'),
        (join) => join.onRef('matching_patients.surgery_id', '=', 'surgeries.id')
      )
      .where('matching_patients.surgery_id', 'is not', null)
      .orderBy('rank', 'desc')
  }

  if (patient_id) {
    query = query.where('surgeries.patient_id', '=', patient_id)
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
    .orderBy('date', 'asc')
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
  const surgeryModels = surgeries.map((surgery) => new SurgeryModel(surgery))

  return { data: surgeryModels, total, pages }
}

export const getWards = async () => {
  return (await db.selectFrom('surgeries').select('ward').distinct().execute()).map(
    (row) => row.ward
  )
}
