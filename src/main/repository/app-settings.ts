import { db } from '../db'
import { sql } from 'kysely'

export const getAllSettings = async () => {
  return await db.selectFrom('app_settings').orderBy('app_settings.key asc').selectAll().execute()
}

export const updateSetting = async (key: string, value: string | null) => {
  // Use upsert (INSERT OR REPLACE) to handle cases where the setting doesn't exist
  // This can happen after restoring old backups that don't have all settings
  await sql`
    INSERT INTO app_settings (key, value, display_name)
    VALUES (${key}, ${value}, ${key})
    ON CONFLICT(key) DO UPDATE SET value = ${value}
  `.execute(db)

  return await db
    .selectFrom('app_settings')
    .where('key', '=', key)
    .selectAll()
    .executeTakeFirst()
}

export const updateSettings = async (settings: { key: string; value: string | null }[]) => {
  for (const setting of settings) {
    await updateSetting(setting.key, setting.value)
  }
}
