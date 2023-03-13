#!/usr/bin/env node
import logger from './util/logger'
import args from './args'
import path from 'path'
import { createMigrationsDir, getPlatformaticConfig, getPrismaConfigFromPackageJson } from './util'
import { downMigration, upMigration } from './migration'

async function main() {
  const { description, migrationsDir, schema, up, down } = args

  const schemaPath = schema ?? (await getPrismaConfigFromPackageJson()) ?? './prisma/schema.prisma'
  const migrationPath = migrationsDir ?? (await getPlatformaticConfig()) ?? './migrations'

  await createMigrationsDir(migrationPath)
  const normalizedMigrationsDir = path.resolve(migrationPath)
  const normalizedSchemaPath = path.resolve(schemaPath)

  if (up) {
    await upMigration(normalizedMigrationsDir, normalizedSchemaPath, description)
  } else if (down) {
    await downMigration(normalizedMigrationsDir, normalizedSchemaPath, description)
  } else {
    await Promise.all([
      upMigration(normalizedMigrationsDir, normalizedSchemaPath, description),
      downMigration(normalizedMigrationsDir, normalizedSchemaPath, description),
    ])
  }
}

main().catch((e) => {
  if (e instanceof Error) {
    logger.error(e.name)
    logger.error(e.message)
  } else {
    logger.error('Oops, something went wrong...')
    logger.error(e)
  }
})

export default main
