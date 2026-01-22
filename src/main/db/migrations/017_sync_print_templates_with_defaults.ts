/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

/**
 * Sync print_templates with default_print_templates.
 *
 * This migration fixes a bug where the user-facing print_templates table
 * was not being updated when default_print_templates was updated.
 *
 * Migrations 013, 014, and 016 correctly updated default_print_templates
 * with new fields (inward_management, discharge_plan, referral), but the
 * user-facing print_templates table was never updated.
 *
 * This migration copies the latest structure from default_print_templates
 * to the matching default entries in print_templates.
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Get all default templates
  const defaults = await db
    .selectFrom('default_print_templates')
    .select(['key', 'type', 'structure'])
    .execute()

  const now = Date.now()

  // Update matching print_templates entries (only default templates)
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
  // Users who need the old templates can manually reset or the app will work with either version
}
