/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('surgeries')
    .addColumn('inward_management', 'text') // HTML rich text for IV drugs during admission
    .execute()

  await db.schema
    .alterTable('surgeries')
    .addColumn('referral', 'text') // HTML rich text for referral letter
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('surgeries').dropColumn('inward_management').execute()
  await db.schema.alterTable('surgeries').dropColumn('referral').execute()
}
