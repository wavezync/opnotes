/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('surgeries')
    .addColumn('doa', 'integer') // Date of Admission
    .execute()

  await db.schema
    .alterTable('surgeries')
    .addColumn('dod', 'integer') // Date of Discharge
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('surgeries').dropColumn('doa').execute()

  await db.schema.alterTable('surgeries').dropColumn('dod').execute()
}
