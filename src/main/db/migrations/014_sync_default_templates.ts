/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'
import { defaultSurgeryTemplate, defaultFollowupTemplate } from '../default-templates'

/**
 * Sync default templates to the current canonical version.
 *
 * This migration applies the templates from default-templates.ts,
 * ensuring all users have the latest default template structure.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db
    .updateTable('default_print_templates')
    .set({ structure: JSON.stringify(defaultSurgeryTemplate) })
    .where('key', '=', 'surgery-standard')
    .execute()

  await db
    .updateTable('default_print_templates')
    .set({ structure: JSON.stringify(defaultFollowupTemplate) })
    .where('key', '=', 'followup-standard')
    .execute()
}

export async function down(_db: Kysely<any>): Promise<void> {
  // No-op: previous migration (013) will restore the prior state if needed
}
