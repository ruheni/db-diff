import { beforeAll, afterAll, expect, test } from 'vitest'
import path from 'path'
import fs from 'fs/promises'

import { execaCommand } from 'execa'
import { createMigrationsDir } from '../../src/util'
import { downMigration, upMigration } from '../../src/migration'

const updatedPath = (resourcePath) => path.join(process.cwd(), resourcePath)

const testConfig = {
  schemaPath: updatedPath('prisma/schema.prisma'),
  migrationsPath: updatedPath('tmp'),
  customMigrationsPath: updatedPath('tmp/migrations'),
  customSchemaPath: updatedPath('test/schema.prisma'),
  dbPath: updatedPath('prisma/dev.db'),
}

beforeAll(async () => {
  await Promise.all([fs.writeFile(testConfig.dbPath, ''), createMigrationsDir(testConfig.migrationsPath)])
})

afterAll(async () => {
  await Promise.all([
    fs.rm(testConfig.dbPath),
    fs.rm(testConfig.migrationsPath, { recursive: true, force: true }),
  ])
})

test('Generate up and down migrations', async () => {
  await Promise.all([
    upMigration(testConfig.migrationsPath, testConfig.schemaPath, 'random'),
    downMigration(testConfig.migrationsPath, testConfig.schemaPath, 'random'),
  ])

  const migrationsDir = await fs.readdir(testConfig.migrationsPath)

  expect(migrationsDir.length).toEqual(2)
  expect(migrationsDir[0]).toBe('001.do.sql')
  expect(migrationsDir[1]).toBe('001.undo.sql')
})

test('No migration generated when already if there are no change', async () => {
  await execaCommand(`npx prisma db execute --file ${testConfig.migrationsPath}/001.do.sql`)

  await Promise.all([
    upMigration(testConfig.migrationsPath, testConfig.schemaPath, 'random'),
    downMigration(testConfig.migrationsPath, testConfig.schemaPath, 'random'),
  ])

  const migrationsDir = await fs.readdir(testConfig.migrationsPath)

  expect(migrationsDir.length).toEqual(2)
})

test('Custom migration directory', async () => {
  await execaCommand(`npx prisma db execute --file ${testConfig.migrationsPath}/001.undo.sql`)
  await createMigrationsDir(testConfig.customMigrationsPath).then(async () => {
    return Promise.all([
      upMigration(testConfig.customMigrationsPath, testConfig.schemaPath, 'random'),
      downMigration(testConfig.customMigrationsPath, testConfig.schemaPath, 'random'),
    ])
  })

  const migrationsDir = await fs.readdir(testConfig.customMigrationsPath)

  expect(migrationsDir.length).toEqual(2)
  expect(migrationsDir[0]).toBe('001.do.sql')
  expect(migrationsDir[1]).toBe('001.undo.sql')
})

test('Custom schema path', async () => {
  await upMigration(testConfig.customMigrationsPath, testConfig.customSchemaPath, 'up')

  const migrationsDir = await fs.readdir(testConfig.customMigrationsPath)
  console.log({ migrationsDir })
  expect(migrationsDir[2]).toBe('002.do.sql')
})

test.todo('Schema path defined in `package.json`')

test.todo('Migration dir defined in `platformatic.config.json`')
