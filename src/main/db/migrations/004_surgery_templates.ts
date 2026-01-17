/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Main table
  await db.schema
    .createTable('surgery_templates')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull())
    .addColumn('category', 'text', (col) => col.notNull())
    .addColumn('tags', 'text') // JSON array of strings, e.g. '["laparoscopic", "emergency"]'
    .addColumn('doctor_id', 'integer', (col) => col.references('doctors.id').onDelete('cascade'))
    .addColumn('created_at', 'integer')
    .addColumn('updated_at', 'integer')
    .execute()

  // Indexes
  await db.schema
    .createIndex('surgery_templates_category_idx')
    .on('surgery_templates')
    .column('category')
    .execute()
  await db.schema
    .createIndex('surgery_templates_doctor_id_idx')
    .on('surgery_templates')
    .column('doctor_id')
    .execute()

  // FTS5 virtual table for full-text search (includes tags for searching)
  await sql`
    CREATE VIRTUAL TABLE surgery_templates_fts USING fts5(
      template_id,
      title,
      category,
      tags,
      content
    )
  `.execute(db)

  // Triggers to sync FTS table
  await sql`
    CREATE TRIGGER insert_template_fts AFTER INSERT ON surgery_templates BEGIN
      INSERT INTO surgery_templates_fts (template_id, title, category, tags, content)
      VALUES (NEW.id, NEW.title, NEW.category, NEW.tags, NEW.content);
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER update_template_fts AFTER UPDATE ON surgery_templates BEGIN
      UPDATE surgery_templates_fts
      SET title = NEW.title, category = NEW.category, tags = NEW.tags, content = NEW.content
      WHERE template_id = NEW.id;
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER delete_template_fts AFTER DELETE ON surgery_templates BEGIN
      DELETE FROM surgery_templates_fts WHERE template_id = OLD.id;
    END
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS delete_template_fts`.execute(db)
  await sql`DROP TRIGGER IF EXISTS update_template_fts`.execute(db)
  await sql`DROP TRIGGER IF EXISTS insert_template_fts`.execute(db)
  await sql`DROP TABLE IF EXISTS surgery_templates_fts`.execute(db)
  await db.schema.dropTable('surgery_templates').execute()
}
