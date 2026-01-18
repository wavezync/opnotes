/* eslint-disable @typescript-eslint/no-explicit-any */
import SQLite from 'better-sqlite3'
import { CompiledQuery, Kysely, Migrator, SqliteDialect } from 'kysely'
import { Database } from '../shared/types/db'
import { join } from 'path'
import { MemoryMigrationProvider } from './db/memory-migration-provider'
import { app } from 'electron'
import log from 'electron-log'

export const DB_PATH = join(app.getPath('userData'), 'data.db')
log.info('DB_PATH:', DB_PATH)

const dialect = new SqliteDialect({
  database: new SQLite(DB_PATH, {
    verbose: log.info.bind(log)
  }),
  onCreateConnection: async (connection) => {
    await connection.executeQuery(CompiledQuery.raw('PRAGMA journal_mode=WAL'))
  }
})

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect
})

export const migrateToLatest = async (db: Kysely<any>) => {
  const migrator = new Migrator({
    db,
    provider: new MemoryMigrationProvider()
  })

  log.info('running db migrations')

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      log.info(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      log.error(`failed to execute migration "${it.migrationName}"`)
    }
  })

  if (error) {
    log.error('failed to migrate')
    log.error(error)
    throw error
  }
}
