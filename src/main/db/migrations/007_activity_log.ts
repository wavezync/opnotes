/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('activity_log')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('entity_type', 'text', (col) => col.notNull()) // 'patient', 'surgery', 'followup', 'doctor'
    .addColumn('entity_id', 'integer', (col) => col.notNull())
    .addColumn('action', 'text', (col) => col.notNull()) // 'created', 'updated', 'deleted'
    .addColumn('title', 'text', (col) => col.notNull()) // Display title for the activity
    .addColumn('description', 'text') // Optional description
    .addColumn('patient_id', 'integer') // For navigation - the patient this relates to
    .addColumn('surgery_id', 'integer') // For navigation - the surgery this relates to (if applicable)
    .addColumn('created_at', 'integer', (col) => col.notNull())
    .execute()

  // Index for efficient querying
  await db.schema
    .createIndex('activity_log_created_at_idx')
    .on('activity_log')
    .column('created_at')
    .execute()

  await db.schema
    .createIndex('activity_log_entity_idx')
    .on('activity_log')
    .columns(['entity_type', 'entity_id'])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('activity_log').execute()
}
