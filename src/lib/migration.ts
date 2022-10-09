import { execaCommand } from "execa";
import fs from "fs/promises";
import logger from "./logger";

type MigrationKind = "up" | "down";

async function createMigrationDirectoryIfNotExists(migrationDir: string) {
  try {
    fs.stat(migrationDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      logger.info("Generating migration folder");
      fs.mkdir(migrationDir);
    }
  }
}

async function getNextMigrationId(files, migrationKind: MigrationKind) {
  const migrations = await fs.readdir(files);

  if (migrationKind === "up") {
    const sortedUpMigrations = migrations
      .filter((migration) => migration.includes(".do.sql"))
      .sort((a, b) => +a - +b);

    return Number(sortedUpMigrations.length) + 1;
  }
  if (migrationKind === "down") {
    const sortedDownMigrations = migrations
      .filter((migration) => migration.includes(".undo.sql"))
      .sort((a, b) => +a - +b);

    return Number(sortedDownMigrations.length) + 1;
  }
}

async function generateMigrations(
  migrationDir,
  schemaPath,
  migrationKind: MigrationKind,
) {
  await createMigrationDirectoryIfNotExists(migrationDir);

  const nextMigrationId = await getNextMigrationId(migrationDir, migrationKind);

  switch (migrationKind) {
    case "up":
      const { stdout: upMigrationStdout } = await execaCommand(
        `npx prisma migrate diff \
         --from-schema-datasource ${schemaPath} \
         --to-schema-datamodel ${schemaPath} \
         --script`,
      );

      if (!upMigrationStdout.includes("empty migration")) {
        await fs
          .appendFile(
            `${migrationDir}/${nextMigrationId}.do.sql`,
            upMigrationStdout,
          )
          .then(() =>
            logger.success(`🗳 Generated new ${nextMigrationId} up migration`),
          );
      } else {
        logger.info("📭 No new up migration was generated.");
      }
      break;

    case "down":
      const { stdout: downMigrationStdout } = await execaCommand(
        `npx prisma migrate diff \
        --from-schema-datamodel ${schemaPath} \
        --to-schema-datasource ${schemaPath} \
         --script`,
      );
      if (!downMigrationStdout.includes("empty migration")) {
        await fs
          .appendFile(
            `${migrationDir}/${nextMigrationId}.undo.sql`,
            downMigrationStdout,
          )
          .then(() =>
            logger.success(`🗳 Generated new ${nextMigrationId} down migration`),
          );
      } else {
        logger.info("📭 No new down migration was generated.");
      }
      break;

    default:
      break;
  }
}

export default generateMigrations;
