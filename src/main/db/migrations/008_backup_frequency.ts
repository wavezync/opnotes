/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Insert backup frequency and time settings
  await db
    .insertInto('app_settings')
    .values([
      { key: 'backup_frequency', value: 'daily', display_name: 'Backup Frequency' },
      { key: 'backup_time', value: '08:00', display_name: 'Backup Time' }
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('app_settings')
    .where('key', 'in', ['backup_frequency', 'backup_time'])
    .execute()
}
