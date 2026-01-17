/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db
    .insertInto('app_settings')
    .values({ key: 'telephone', value: null, display_name: 'Telephone' })
    .execute()
}

export async function down(_db: Kysely<any>): Promise<void> {
  // down
}
