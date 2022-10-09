#!/usr/bin/env node
import logger from "./lib/logger";
import generateMigrations from "./lib/migration";
import CLI from "./cli";
import path from "path";
async function main() {
  const { migrationsDir, schema, up, down } = CLI();

  const normalizedMigrationsDirPath = path.join(process.cwd(), migrationsDir);
  const normalizedSchemaPath = path.join(process.cwd(), schema);
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
    Promise.all([
      await generateMigrations(
        normalizedMigrationsDirPath,
        normalizedSchemaPath,
        "down",
      ),
      await generateMigrations(
        normalizedMigrationsDirPath,
        normalizedSchemaPath,
        "up",
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
