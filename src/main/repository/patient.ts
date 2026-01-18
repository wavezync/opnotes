import { sql } from 'kysely'
import { NewPatient, PatientUpdate } from '../../shared/types/db'
import { db } from '../db'
import { NewWithoutTimestamps, addTimestamps } from '../utils/sql'
import { PatientModel } from '../../shared/models/PatientModel'
import { PatientFilter } from '../../shared/types/api'
import { logActivity } from './activity'

export const createNewPatient = async (patient: NewWithoutTimestamps<NewPatient>) => {
  const data = addTimestamps(patient)
  const result = await db.insertInto('patients').values(data).returningAll().executeTakeFirst()

  if (result) {
    await logActivity({
      entityType: 'patient',
      entityId: result.id,
      action: 'created',
      title: result.name,
      description: `PHN: ${result.phn}`,
      patientId: result.id
    })
  }

  return result
}

export const getPatientById = async (id: number) => {
  // select patient and the ward from last surgery

  const result = await db.selectFrom('patients').where('id', '=', id).selectAll().executeTakeFirst()

  if (!result) {
    return null
  }

  const patient = new PatientModel(result)

  // find the ward from last surgery
  const lastSurgery = await db
    .selectFrom('surgeries')
    .where('patient_id', '=', id)
    .orderBy('date', 'desc')
    .select('ward')
    .executeTakeFirst()

  if (lastSurgery) {
    patient.ward = lastSurgery.ward
  }

  return patient
}

export const updatePatientById = async (id: number, patient: PatientUpdate) => {
  const result = await db
    .updateTable('patients')
    .set(patient)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()

  if (result) {
    await logActivity({
      entityType: 'patient',
      entityId: result.id,
      action: 'updated',
      title: result.name,
      description: `PHN: ${result.phn}`,
      patientId: result.id
    })

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
  const { search, pageSize = 25, page = 0, sortBy = 'updated_at', sortOrder = 'desc' } = filter

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
  }

  // Apply sorting based on sortBy option
  // For age, sort by birth_year in reverse (lower birth_year = older age)
  let sortedQuery = query.selectAll('patients')

  switch (sortBy) {
    case 'name':
      sortedQuery = sortedQuery.orderBy('patients.name', sortOrder)
      break
    case 'phn':
      sortedQuery = sortedQuery.orderBy('patients.phn', sortOrder)
      break
    case 'age':
      // Reverse sort order for age since lower birth_year = older
      sortedQuery = sortedQuery.orderBy('patients.birth_year', sortOrder === 'asc' ? 'desc' : 'asc')
      break
    case 'created_at':
      sortedQuery = sortedQuery.orderBy('patients.created_at', sortOrder)
      break
    case 'updated_at':
    default:
      sortedQuery = sortedQuery.orderBy('patients.updated_at', sortOrder)
      break
  }

  const patients = await sortedQuery.limit(pageSize).offset(page * pageSize).execute()

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

export const deletePatientById = async (id: number) => {
  return await db.deleteFrom('patients').where('id', '=', id).execute()
}
