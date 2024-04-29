import { NewDoctor, DoctorUpdate } from '../../shared/types/db'
import { db } from '../db'

export const createNewDoctor = async (doctor: NewDoctor) => {
  return await db.insertInto('doctors').values(doctor).returningAll().execute()
}

export const getDoctorById = async (id: number) => {
  return await db.selectFrom('doctors').where('id', '=', id).selectAll().executeTakeFirst()
}

export const updateDoctorById = async (id: number, doctor: DoctorUpdate) => {
  return await db.updateTable('doctors').set(doctor).where('id', '=', id).execute()
}
