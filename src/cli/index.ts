import { Command } from "commander";
import { version } from "../../package.json";

type CliInput = {
  up: boolean;
  down: boolean;
  schema: string;
  migrationsDir: string;
};
export default () => {
  const program = new Command();

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
      "./migrations",
    )
    .option("--up", "Generates the `up` migration only", false)
    .option("--down", "Generates the `down` migration only", false)
    .parse(process.argv);

  return program.opts<CliInput>();
};
