import { Command } from "commander";
import { version } from "../../package.json";
import { loadConfig } from '@platformatic/db/lib/load-config.mjs'

type CliInput = {
  up: boolean;
  down: boolean;
  schema: string;
  migrationsDir: string;
};

export default async () => {
  const program = new Command();
  const { configManager: { current } } = await loadConfig({}, "")

  const migrationsDir = current.migrations.dir ?? "./migrations";

  program
    .name("")
    .description("")
    .version(version)
    .option(
      "--schema <path-to-your-schema-file>",
      "Path to your Prisma schema file. Default value is `./prisma/schema.prisma`",
      "./prisma/schema.prisma",
    )
    .option(
      "--migrations-dir <path-to-your-migrations-dir>",
      "Path to your migrations directory. Default value is `migrations`",
      migrationsDir,
    )
    .option("--up", "Generates the `up` migration only", false)
    .option("--down", "Generates the `down` migration only", false)
    .parse(process.argv);

  return program.opts<CliInput>();
};
