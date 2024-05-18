import { sql } from 'kysely'
import { NewDoctor, DoctorUpdate } from '../../shared/types/db'
import { db } from '../db'
import { DoctorFilter } from '../../shared/types/api'

export const createNewDoctor = async (doctor: NewDoctor) => {
  return await db.insertInto('doctors').values(doctor).returningAll().execute()
}

export const getDoctorById = async (id: number) => {
  return await db.selectFrom('doctors').where('id', '=', id).selectAll().executeTakeFirst()
}

export const updateDoctorById = async (id: number, doctor: DoctorUpdate) => {
  return await db.updateTable('doctors').set(doctor).where('id', '=', id).execute()
}

export const listDoctors = async (filter: DoctorFilter) => {
  const { search, pageSize = 25, page = 0 } = filter

  let query = db.selectFrom('doctors').selectAll('doctors')

  if (search) {
    const term = `${search}*`
    query = query
      .innerJoin('doctors_fts', 'doctors_fts.doctor_id', 'doctors.id')
      .where(sql<boolean>`doctors_fts MATCH ${term}`)
      .orderBy(sql`rank`, 'desc')
  }

  const doctors = await query
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

  return { data: doctors, total, pages }
}
