import { Migration, MigrationProvider } from 'kysely'
import * as migrations from './migrations'

export class MemoryMigrationProvider implements MigrationProvider {
  getMigrations(): Promise<Record<string, Migration>> {
    return Promise.resolve(migrations.default)
  }
}
