#!/usr/bin/env node
import logger from "./lib/logger";
import generateMigrations, {
  createMigrationDirectoryIfNotExists,
} from "./lib/migration";
import CLI from "./cli";
import path from "path";

async function main() {
  const { migrationsDir, schema, up, down } = await CLI();

  const normalizedMigrationsDirPath = path.resolve(migrationsDir);
  const normalizedSchemaPath = path.resolve(schema);

  await createMigrationDirectoryIfNotExists(normalizedMigrationsDirPath);
  if (up) {
    await generateMigrations(
      normalizedMigrationsDirPath,
      normalizedSchemaPath,
      "up",
    );
  } else if (down) {
    await generateMigrations(
      normalizedMigrationsDirPath,
      normalizedSchemaPath,
      "down",
    );
  } else {
    await Promise.all([
      generateMigrations(
        normalizedMigrationsDirPath,
        normalizedSchemaPath,
        "up",
      ),
      generateMigrations(
        normalizedMigrationsDirPath,
        normalizedSchemaPath,
        "down",
      ),
    ]);
  }
}

main().catch((e) => {
  if (e instanceof Error) {
    logger.error(e.name);
    logger.error(e.message);
  } else {
    logger.error("Oops, something went wrong...");
    logger.error(e);
  }
});

export default main;
