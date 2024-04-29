import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('patients')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('name', 'text')
    .addColumn('phn', 'text', (col) => col.unique().notNull())
    .addColumn('gender', 'text', (col) => col.notNull())
    .addColumn('birth_year', 'integer')
    .addColumn('created_at', 'integer')
    .addColumn('updated_at', 'integer')
    .execute()

  await db.schema.createIndex('patients_phn_index').on('patients').column('phn').execute()

  await db.schema
    .createTable('doctors')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('name', 'text')
    .addColumn('designation', 'text')
    .addColumn('slmc_reg_no', 'text')
    .addColumn('created_at', 'integer')
    .addColumn('updated_at', 'integer')
    .execute()

  await db.schema
    .createTable('surgeries')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('title', 'text')
    .addColumn('bht', 'text')
    .addColumn('ward', 'text')
    .addColumn('date', 'integer')
    .addColumn('notes', 'text')
    .addColumn('post_op_notes', 'text')
    .addColumn('patient_id', 'integer', (col) => col.references('patients.id'))
    .addColumn('created_at', 'integer')
    .addColumn('updated_at', 'integer')
    .execute()

  await db.schema
    .createTable('surgery_doctors_done_by')
    .addColumn('surgery_id', 'integer', (col) => col.references('surgeries.id'))
    .addColumn('doctor_id', 'integer', (col) => col.references('doctors.id'))
    .execute()

  await db.schema
    .createTable('surgery_doctors_assisted_by')
    .addColumn('surgery_id', 'integer', (col) => col.references('surgeries.id'))
    .addColumn('doctor_id', 'integer', (col) => col.references('doctors.id'))
    .execute()

  await db.schema
    .createTable('surgery_follow_up')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('notes', 'text')
    .addColumn('surgery_id', 'integer', (col) => col.references('surgeries.id'))
    .addColumn('created_at', 'integer')
    .addColumn('updated_at', 'integer')
    .execute()

  // create fts5 virtual table for full-text search
  // we need to search by phn, name, bht, doctor name, and surgery title

  await sql`
    CREATE VIRTUAL TABLE patients_fts USING fts5(
      name,
      phn,
      content='patients',
      content_rowid='id'
    )
  `.execute(db)

  await sql`CREATE VIRTUAL TABLE surgeries_fts USING fts5(
      title,
      bht,
      content='surgeries',
      content_rowid='id'
    )
  `.execute(db)

  await sql`CREATE VIRTUAL TABLE doctors_fts USING fts5(
      name,
      content='doctors',
      content_rowid='id'
    )`.execute(db)

  await sql`CREATE TRIGGER patients_ai AFTER INSERT ON patients BEGIN
      INSERT INTO patients_fts(rowid, name, phn) VALUES (new.id, new.name, new.phn);
    END`.execute(db)

  await sql`CREATE TRIGGER patients_ad AFTER DELETE ON patients BEGIN
      INSERT INTO patients_fts(patients_fts, rowid, name, phn) VALUES ('delete', old.id, old.name, old.phn);
    END`.execute(db)

  await sql`CREATE TRIGGER patients_au AFTER UPDATE ON patients BEGIN
      INSERT INTO patients_fts(patients_fts, rowid, name, phn) VALUES ('delete', old.id, old.name, old.phn);
      INSERT INTO patients_fts(rowid, name, phn) VALUES (new.id, new.name, new.phn);
    END`.execute(db)

  await sql`CREATE TRIGGER surgeries_ai AFTER INSERT ON surgeries BEGIN
      INSERT INTO surgeries_fts(rowid, title, bht) VALUES (new.id, new.title, new.bht);
    END`.execute(db)

  await sql`CREATE TRIGGER surgeries_ad AFTER DELETE ON surgeries BEGIN
      INSERT INTO surgeries_fts(surgeries_fts, rowid, title, bht) VALUES ('delete', old.id, old.title, old.bht);
    END`.execute(db)

  await sql`CREATE TRIGGER surgeries_au AFTER UPDATE ON surgeries BEGIN
      INSERT INTO surgeries_fts(surgeries_fts, rowid, title, bht) VALUES ('delete', old.id, old.title, old.bht);
      INSERT INTO surgeries_fts(rowid, title, bht) VALUES (new.id, new.title, new.bht);
    END`.execute(db)

  await sql`CREATE TRIGGER doctors_ai AFTER INSERT ON doctors BEGIN
      INSERT INTO doctors_fts(rowid, name) VALUES (new.id, new.name);
    END`.execute(db)

  await sql`CREATE TRIGGER doctors_ad AFTER DELETE ON doctors BEGIN
      INSERT INTO doctors_fts(doctors_fts, rowid, name) VALUES ('delete', old.id, old.name);
    END`.execute(db)

  await sql`CREATE TRIGGER doctors_au AFTER UPDATE ON doctors BEGIN
      INSERT INTO doctors_fts(doctors_fts, rowid, name) VALUES ('delete', old.id, old.name);
      INSERT INTO doctors_fts(rowid, name) VALUES (new.id, new.name);
    END
  `.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('patients').execute()
  await db.schema.dropTable('doctors').execute()
  await db.schema.dropTable('surgeries').execute()
  await db.schema.dropTable('surgery_doctors_done_by').execute()
  await db.schema.dropTable('surgery_doctors_assisted_by').execute()
  await db.schema.dropTable('surgery_follow_up').execute()

  await sql`
    DROP TABLE patients_fts
  `.execute(db)

  await sql`
    DROP TABLE surgeries_fts
  `.execute(db)

  await sql`
    DROP TABLE doctors_fts
  `.execute(db)

  await sql`
    DROP TRIGGER patients_ai
  `.execute(db)

  await sql`
    DROP TRIGGER patients_ad
  `.execute(db)

  await sql`
    DROP TRIGGER patients_au
  `.execute(db)

  await sql`
    DROP TRIGGER surgeries_ai
  `.execute(db)

  await sql`
    DROP TRIGGER surgeries_ad
  `.execute(db)

  await sql`
    DROP TRIGGER surgeries_au
  `.execute(db)

  await sql`
    DROP TRIGGER doctors_ai
  `.execute(db)

  await sql`
    DROP TRIGGER doctors_ad
  `.execute(db)

  await sql`
    DROP TRIGGER doctors_au
  `.execute(db)

  await db.schema.dropIndex('patients_phn_index').on('patients').execute()
}
