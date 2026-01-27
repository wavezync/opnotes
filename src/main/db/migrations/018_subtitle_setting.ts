/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'
import { defaultSurgeryTemplate, defaultFollowupTemplate } from '../default-templates'

/**
 * Add subtitle support to print templates.
 *
 * This migration:
 * 1. Updates default_print_templates with the new template structure (includes showSubtitle prop)
 * 2. Syncs print_templates with the updated defaults
 */
export async function up(db: Kysely<any>): Promise<void> {
  const now = Date.now()

  // Update default_print_templates with new template structures
  await db
    .updateTable('default_print_templates')
    .set({
      structure: JSON.stringify(defaultSurgeryTemplate)
    })
    .where('key', '=', 'surgery-standard')
    .execute()

  await db
    .updateTable('default_print_templates')
    .set({
      structure: JSON.stringify(defaultFollowupTemplate)
    })
    .where('key', '=', 'followup-standard')
    .execute()

  // Sync print_templates with updated defaults
  const defaults = await db
    .selectFrom('default_print_templates')
    .select(['key', 'type', 'structure'])
    .execute()

  for (const defaultTemplate of defaults) {
    await db
      .updateTable('print_templates')
      .set({
        structure: defaultTemplate.structure,
        updated_at: now
      })
      .where('type', '=', defaultTemplate.type)
      .where('is_default', '=', 1)
      .execute()
  }
}

export async function down(_db: Kysely<any>): Promise<void> {
  // No-op: This is a data sync migration, not reversible without storing old data
}
