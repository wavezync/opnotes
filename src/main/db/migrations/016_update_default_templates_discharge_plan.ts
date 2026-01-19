/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'
import { defaultSurgeryTemplate } from '../default-templates'

/**
 * Update default surgery template to include discharge_plan field.
 *
 * This migration applies the updated template from default-templates.ts,
 * which now includes the discharge_plan conditional block.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('default_print_templates')
    .set({ structure: JSON.stringify(defaultSurgeryTemplate) })
    .where('key', '=', 'surgery-standard')
    .execute()
}

export async function down(_db: Kysely<any>): Promise<void> {
  // No-op: previous migration (014) will restore the prior state if needed
}
