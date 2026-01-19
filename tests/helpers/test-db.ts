import SQLite from 'better-sqlite3'
import { CompiledQuery, Kysely, Migrator, SqliteDialect } from 'kysely'
import { Database } from '../../src/shared/types/db'
import { MemoryMigrationProvider } from '../../src/main/db/memory-migration-provider'

/**
 * Creates an in-memory SQLite database for testing
 */
export function createTestDb(): Kysely<Database> {
  const dialect = new SqliteDialect({
    database: new SQLite(':memory:'),
    onCreateConnection: async (connection) => {
      await connection.executeQuery(CompiledQuery.raw('PRAGMA journal_mode=WAL'))
    }
  })

  return new Kysely<Database>({ dialect })
}

/**
 * Runs all migrations on the test database
 */
export async function migrateTestDb(db: Kysely<Database>): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new MemoryMigrationProvider()
  })

  const { error } = await migrator.migrateToLatest()
  if (error) {
    throw error
  }
}

/**
 * Creates a fully migrated test database
 */
export async function createMigratedTestDb(): Promise<Kysely<Database>> {
  const db = createTestDb()
  await migrateTestDb(db)
  return db
}

/**
 * Cleans up all data from the database (keeps schema)
 */
export async function cleanupTestDb(db: Kysely<Database>): Promise<void> {
  // Delete in reverse dependency order
  await db.deleteFrom('surgery_followups').execute()
  await db.deleteFrom('surgery_doctors_done_by').execute()
  await db.deleteFrom('surgery_doctors_assisted_by').execute()
  await db.deleteFrom('surgeries').execute()
  await db.deleteFrom('doctors').execute()
  await db.deleteFrom('patients').execute()
  await db.deleteFrom('surgery_templates').execute()
  await db.deleteFrom('activity_log').execute()
  // Keep app_settings as it has defaults
}

/**
 * Closes the test database connection
 */
export async function closeTestDb(db: Kysely<Database>): Promise<void> {
  await db.destroy()
}
