/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('surgeries')
    .addColumn('discharge_plan', 'text') // HTML rich text for discharge plan and instructions
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('surgeries').dropColumn('discharge_plan').execute()
}
