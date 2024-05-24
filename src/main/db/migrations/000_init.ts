/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('patients')
    .addColumn('id', 'integer', (col) => col.autoIncrement().primaryKey())
    .addColumn('name', 'text')
    .addColumn('phn', 'text', (col) => col.unique().notNull())
    .addColumn('gender', 'text', (col) => col.notNull())
    .addColumn('address', 'text')
    .addColumn('phone', 'text')
    .addColumn('emergency_contact', 'text')
    .addColumn('emergency_phone', 'text')
    .addColumn('remarks', 'text')
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
    .createTable('surgery_followups')
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
      patient_id,
      name,
      phn,
    )
  `.execute(db)

  await sql`
    CREATE VIRTUAL TABLE surgeries_fts USING fts5(
      patient_id,
      surgery_id,
      title,
      bht,
    )
  `.execute(db)

  await sql`
    CREATE VIRTUAL TABLE doctors_fts USING fts5(
      doctor_id,
      name,
      slmc_reg_no,
    )
  `.execute(db)

  await sql`
    CREATE TRIGGER insert_patient_fts AFTER INSERT ON patients BEGIN
      INSERT INTO patients_fts (patient_id, name, phn) VALUES (NEW.id, NEW.name, NEW.phn);
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER update_patient_fts AFTER UPDATE ON patients BEGIN
      UPDATE patients_fts SET name = NEW.name, phn = NEW.phn WHERE patient_id = NEW.id;
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER delete_patient_fts AFTER DELETE ON patients BEGIN
      DELETE FROM patients_fts WHERE patient_id = OLD.id;
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER insert_surgery_fts AFTER INSERT ON surgeries BEGIN
      INSERT INTO surgeries_fts (patient_id, surgery_id, title, bht) VALUES (NEW.patient_id, NEW.id, NEW.title, NEW.bht);
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER update_surgery_fts AFTER UPDATE ON surgeries BEGIN
      UPDATE surgeries_fts SET title = NEW.title, bht = NEW.bht WHERE surgery_id = NEW.id;
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER delete_surgery_fts AFTER DELETE ON surgeries BEGIN
      DELETE FROM surgeries_fts WHERE surgery_id = OLD.id;
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER insert_doctor_fts AFTER INSERT ON doctors BEGIN
      INSERT INTO doctors_fts (doctor_id, name, slmc_reg_no) VALUES (NEW.id, NEW.name, NEW.slmc_reg_no);
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER update_doctor_fts AFTER UPDATE ON doctors BEGIN
      UPDATE doctors_fts SET name = NEW.name, slmc_reg_no = NEW.slmc_reg_no WHERE doctor_id = NEW.id;
    END
  `.execute(db)

  await sql`
    CREATE TRIGGER delete_doctor_fts AFTER DELETE ON doctors BEGIN
      DELETE FROM doctors_fts WHERE doctor_id = OLD.id;
    END
  `.execute(db)
}

export async function down(_db: Kysely<any>): Promise<void> {
  // down
}
