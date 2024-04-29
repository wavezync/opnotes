import { NewPatient, PatientUpdate } from '../../shared/types/db'
import { db } from '../db'

export const createNewPatient = async (patient: NewPatient) => {
  return await db.insertInto('patients').values(patient).returningAll().execute()
}

export const getPatientById = async (id: number) => {
  return await db.selectFrom('patients').where('id', '=', id).selectAll().executeTakeFirst()
}

export const updatePatientById = async (id: number, patient: PatientUpdate) => {
  return await db.updateTable('patients').set(patient).where('id', '=', id).execute()
}
