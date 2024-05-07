import { sql } from 'kysely'
import { NewPatient, PatientUpdate } from '../../shared/types/db'
import { db } from '../db'
import { NewWithoutTimestamps, addTimestamps } from '../utils/sql'
import { PatientModel } from '../../shared/models/PatientModel'
import { PatientFilter } from '../../shared/types/api'

export const createNewPatient = async (patient: NewWithoutTimestamps<NewPatient>) => {
  const data = addTimestamps(patient)
  return await db.insertInto('patients').values(data).returningAll().executeTakeFirst()
}

export const getPatientById = async (id: number) => {
  // select patient and the ward from last surgery

  const result = await db.selectFrom('patients').where('id', '=', id).selectAll().executeTakeFirst()

  if (result) {
    return new PatientModel(result)
  }

  return undefined
}

export const updatePatientById = async (id: number, patient: PatientUpdate) => {
  const result = await db
    .updateTable('patients')
    .set(patient)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()

  if (result) {
    return new PatientModel(result)
  }

  return undefined
}

export const findPatientByPHN = async (phn: string) => {
  const result = await db
    .selectFrom('patients')
    .where('phn', '=', phn)
    .selectAll()
    .executeTakeFirst()
  if (result) {
    return new PatientModel(result)
  }

  return undefined
}

export const listPatients = async (filter: PatientFilter) => {
  const { search, pageSize = 25, page = 0 } = filter

  let query = db.selectFrom('patients')
  if (search) {
    const term = `${search}*`
    query = query
      .leftJoin(
        (eb) =>
          eb
            .selectFrom('patients_fts')
            .select(['patient_id', sql<number>`rank`.as('rank')])
            .where(sql<boolean>`patients_fts MATCH ${term}`)
            .union((eb) =>
              eb
                .selectFrom('surgeries_fts')
                .select(['patient_id', sql<number>`rank`.as('rank')])
                .where(sql<boolean>`surgeries_fts MATCH ${term}`)
            )
            .as('matching_patients'),
        (join) => join.onRef('matching_patients.patient_id', '=', 'patients.id')
      )
      .where('matching_patients.patient_id', 'is not', null)
      .orderBy('rank', 'desc')
  }
  const patients = await query
    .selectAll('patients')
    .orderBy('created_at desc')
    .limit(pageSize)
    .offset(page * pageSize)
    .execute()

  const mappedPatients = patients.map((patient) => new PatientModel(patient))

  const totalResult = await query
    .clearSelect()
    .clearOrderBy()
    .clearLimit()
    .clearOffset()
    .select((eb) => eb.fn.countAll<number>().as('total'))
    .executeTakeFirst()

  const total = totalResult?.total ?? 0
  const pages = Math.ceil(total / pageSize)

  return { data: mappedPatients, total, pages }
}

export const countAllPatients = async () => {
  return await db
    .selectFrom('patients')
    .select((eb) => eb.fn.countAll<number>().as('total'))
    .executeTakeFirst()
}
