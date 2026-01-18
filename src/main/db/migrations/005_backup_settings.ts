/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Insert backup settings
  await db
    .insertInto('app_settings')
    .values([
      { key: 'backup_enabled', value: 'true', display_name: 'Backup Enabled' },
      { key: 'backup_folder', value: null, display_name: 'Backup Folder' },
      { key: 'last_backup_time', value: null, display_name: 'Last Backup Time' }
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db
    .deleteFrom('app_settings')
    .where('key', 'in', ['backup_enabled', 'backup_folder', 'last_backup_time'])
    .execute()
}
