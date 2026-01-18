/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Check if hospital AND unit are already configured
  const hospitalSetting = await db
    .selectFrom('app_settings')
    .select('value')
    .where('key', '=', 'hospital')
    .executeTakeFirst()

  const unitSetting = await db
    .selectFrom('app_settings')
    .select('value')
    .where('key', '=', 'unit')
    .executeTakeFirst()

  // If both are set, mark onboarding as complete (existing configured user)
  const isAlreadyConfigured = hospitalSetting?.value && unitSetting?.value

  await db
    .insertInto('app_settings')
    .values({
      key: 'onboarding_completed',
      value: isAlreadyConfigured ? 'true' : null,
      display_name: 'Onboarding Completed'
    })
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom('app_settings').where('key', '=', 'onboarding_completed').execute()
}
