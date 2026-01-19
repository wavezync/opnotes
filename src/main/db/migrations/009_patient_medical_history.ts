/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('patients')
    .addColumn('blood_group', 'text') // A+, A-, B+, B-, AB+, AB-, O+, O-
    .execute()

  await db.schema
    .alterTable('patients')
    .addColumn('allergies', 'text') // Comma-separated tags
    .execute()

  await db.schema
    .alterTable('patients')
    .addColumn('conditions', 'text') // Comma-separated tags (pre-existing conditions)
    .execute()

  await db.schema
    .alterTable('patients')
    .addColumn('medications', 'text') // Comma-separated tags (current medications)
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('patients').dropColumn('blood_group').execute()
  await db.schema.alterTable('patients').dropColumn('allergies').execute()
  await db.schema.alterTable('patients').dropColumn('conditions').execute()
  await db.schema.alterTable('patients').dropColumn('medications').execute()
}
