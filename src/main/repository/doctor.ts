import { sql } from 'kysely'
import { NewDoctor, DoctorUpdate } from '../../shared/types/db'
import { db } from '../db'
import { DoctorFilter } from '../../shared/types/api'
import { DoctorModel } from '../../shared/models/DoctorModel'
import { NewWithoutTimestamps, addTimestamps } from '../utils/sql'

export const createNewDoctor = async (doctor: NewWithoutTimestamps<NewDoctor>) => {
  const data = addTimestamps(doctor)
  const result = await db.insertInto('doctors').values(data).returningAll().executeTakeFirst()

  if (result) {
    return new DoctorModel(result)
  }

  throw new Error('Failed to create doctor')
}

export const getDoctorById = async (id: number) => {
  const result = await db.selectFrom('doctors').where('id', '=', id).selectAll().executeTakeFirst()

  if (result) {
    return new DoctorModel(result)
  }

  return null
}

export const updateDoctorById = async (id: number, doctor: DoctorUpdate) => {
  const data = addTimestamps(doctor, {
    createdAt: false,
    updatedAt: true
  })
  const updated = await db
    .updateTable('doctors')
    .set(data)
    .where('id', '=', id)
    .returningAll()
    .executeTakeFirst()

  if (updated) {
    return new DoctorModel(updated)
  }

  return null
}

export const deleteDoctorById = async (id: number) => {
  return await db.deleteFrom('doctors').where('id', '=', id).execute()
}

export const listDoctors = async (filter: DoctorFilter) => {
  const { search, pageSize = 25, page = 0, sortBy = 'updated_at', sortOrder = 'desc' } = filter

  let query = db.selectFrom('doctors').selectAll('doctors')

  if (search) {
    const term = `${search}*`
    query = query
      .innerJoin('doctors_fts', 'doctors_fts.doctor_id', 'doctors.id')
      .where(sql<boolean>`doctors_fts MATCH ${term}`)
  }

  // Apply sorting
  let sortedQuery = query
  switch (sortBy) {
    case 'name':
      sortedQuery = sortedQuery.orderBy('doctors.name', sortOrder)
      break
    case 'designation':
      sortedQuery = sortedQuery.orderBy('doctors.designation', sortOrder)
      break
    case 'created_at':
      sortedQuery = sortedQuery.orderBy('doctors.created_at', sortOrder)
      break
    case 'updated_at':
    default:
      sortedQuery = sortedQuery.orderBy('doctors.updated_at', sortOrder)
      break
  }

  const doctorResult = await sortedQuery.limit(pageSize).offset(page * pageSize).execute()

  const totalResult = await query
    .clearSelect()
    .clearOrderBy()
    .clearLimit()
    .clearOffset()
    .select((eb) => eb.fn.countAll<number>().as('total'))
    .executeTakeFirst()

  const total = totalResult?.total ?? 0
  const pages = Math.ceil(total / pageSize)
  const doctors = doctorResult.map((doctor) => new DoctorModel(doctor))

  return { data: doctors, total, pages }
}
