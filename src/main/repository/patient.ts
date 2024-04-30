import { sql } from 'kysely'
import { NewPatient, Patient, PatientUpdate } from '../../shared/types/db'
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

export const lookupPatient = async (search: string) => {
  // use a full text search to find the patient by name or phn
  // with sqlite fts5, we can use the match operator to search for the terms

  return await sql<Patient[]>`
    SELECT * FROM patients
    INNER JOIN patients_fts ON patients.id = patients_fts.patient_id
    WHERE patients_fts MATCH ${search}
    ORDER BY rank, patients.updated_at DESC
  `.execute(db)
}

export interface PatientFilter {
  search?: string

  pageSize?: number
  page?: number
}

export const listPatients = async (filter: PatientFilter) => {
  const { search, pageSize = 50, page = 0 } = filter

  let query = db.selectFrom('patients').selectAll('patients')

  if (search) {
    query = query
      .leftJoin('patients_fts', 'patients_fts.patient_id', 'patients.id')
      .where(sql<boolean>`patients_fts MATCH ${search}`)
      .orderBy(sql`rank`, 'desc')
  }

  const patients = await query
    .orderBy('created_at desc')
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

  return { data: patients, total, pages }
}
