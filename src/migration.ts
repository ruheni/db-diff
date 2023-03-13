import { execaCommand } from 'execa'
import fs from 'fs/promises'
import logger from './util/logger'

export async function upMigration(migrationDir, schemaPath, description) {
  const migrationId = await nextMigrationId(migrationDir, 'up')

  try {
    await execaCommand(
      `npx prisma migrate diff \
        --from-schema-datasource ${schemaPath} \
        --to-schema-datamodel ${schemaPath} \
        --script \
        --exit-code`,
    )

    /** Error Code 0 if success (Empty migration) */
    logger.gray('📭 No up migration was generated.')
  } catch (error) {
    /**
     * non-empty migration
     */
    if (error.exitCode === 2) {
      await fs
        .writeFile(`${migrationDir}/${migrationId}.do.sql`, error.stdout)
        .then(() => logger.success(`🗳 Generated ${migrationId}.do.sql up migration`))
    } else {
      logger.error(`Oops, something went wrong: \n${error}`)
    }
  }
}

export async function downMigration(migrationDir, schemaPath, description) {
  const migrationId = await nextMigrationId(migrationDir, 'down')
  try {
    await execaCommand(
      `npx prisma migrate diff \
      --from-schema-datamodel ${schemaPath} \
      --to-schema-datasource ${schemaPath} \
       --script \
       --exit-code`,
    )
    /** Error Code 0 if success (Empty migration) */
    logger.gray('📭 No down migration was generated.')
  } catch (error) {
    /**
     * non-empty migration
     */
    if (error.exitCode === 2) {
      await fs
        .writeFile(`${migrationDir}/${migrationId}.undo.sql`, error.stdout)
        .then(() => logger.success(`🗳 Generated ${migrationId}.undo.sql down migration`))
    } else {
      logger.error(`Oops, something went wrong: ${error}
      `)
    }
  }
}
type MigrationKind = 'up' | 'down'

async function nextMigrationId(files, migrationKind: MigrationKind) {
  const migrationDir = await fs.readdir(files)

  const filter = migrationKind === 'up' ? '.do.sql' : '.undo.sql'

  const sortedMigrations = migrationDir
    .filter((migration) => migration.endsWith(filter))
    .sort((a, b) => +a - +b)

  return (sortedMigrations.length + 1).toString().padStart(3, '0')
}
