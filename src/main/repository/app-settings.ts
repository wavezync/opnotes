import { db } from '../db'

export const getAllSettings = async () => {
  return await db.selectFrom('app_settings').orderBy('app_settings.key asc').selectAll().execute()
}

export const updateSetting = async (key: string, value: string | null) => {
  return await db
    .updateTable('app_settings')
    .set({
      value
    })
    .where('key', '=', key)
    .returningAll()
    .executeTakeFirst()
}

export const updateSettings = async (settings: { key: string; value: string | null }[]) => {
  for (const setting of settings) {
    await updateSetting(setting.key, setting.value)
  }
}
