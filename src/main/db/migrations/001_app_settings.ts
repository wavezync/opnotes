/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('app_settings')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('key', 'text', (col) => col.unique().notNull())
    .addColumn('value', 'text')
    .addColumn('display_name', 'text')
    .execute()

  // Insert default settings
  await db
    .insertInto('app_settings')
    .values([
      { key: 'hospital', value: null, display_name: 'Hospital' },
      { key: 'unit', value: null, display_name: 'Unit' }
    ])
    .execute()
}

export async function down(_db: Kysely<any>): Promise<void> {
  // down
}
