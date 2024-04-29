import { NewSurgery, SurgeryUpdate } from '../../shared/types/db'
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
