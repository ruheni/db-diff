import { version } from '../package.json'
import { Command } from '@molt/command'
import { z } from 'zod'

const args = Command.parameters({
  'description d': z
    .string()
    .optional()
    // TODO: add validation to replace "." with ""
    .describe('Label to help keep track of what happens in the script. It should not contain periods'),
  schema: z
    .string()
    .optional()
    .describe(
      'Path to your Prisma schema file. The default file is either the `schema` property in the `package.json` file. If unavailable, the default is `./prisma/schema.prisma`',
    ),
  'migrations-dir': z
    .string()
    .optional()
    .describe(
      'Path to your migrations directory. The default directory used is from the Platformatic config file. If the configuration is missing, the db-diff will default to `/migrations`.',
    ),
  up: z.boolean().default(false).describe('Generate `up` migration only'),
  down: z.boolean().default(false).describe('Generate `down` migration only'),
  version: z.string().default(version),
}).parse()

export default args
