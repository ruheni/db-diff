import fs from 'fs/promises'
import { readPackageUp } from 'read-pkg-up'
import { loadConfig } from '@platformatic/db/lib/load-config.mjs'
import logger from './logger'

/**
 * Retrieve Prisma schema config in package.json
 */
export async function getPrismaConfigFromPackageJson(): Promise<null | undefined | string> {
  const pkgJson = await readPackageUp()

  if (!pkgJson) return null

  const schema = pkgJson?.packageJson?.prisma?.schema

  return schema
}

/**
 * Retrieve Platformatic migration config
 */
export async function getPlatformaticConfig(): Promise<string | null> {
  const {
    configManager: {
      current: { migrations },
    },
  } = await loadConfig({}, '')

  if (!migrations) return null

  return migrations.dir
}

/**
 * Create migration directory if it doesn't
 */
export async function createMigrationsDir(migrationDir: string) {
  try {
    await fs.stat(migrationDir)
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.info(`Creating your migration folder in ${migrationDir}`)
      fs.mkdir(migrationDir, { recursive: true })
    }
  }
}
