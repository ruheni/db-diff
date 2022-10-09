import { execaCommand } from "execa";
import fs from "fs/promises";
import commandRunner from "./commandRunner";
import logger from "./logger";

type MigrationKind = "up" | "down";

async function createMigrationDirectoryIfNotExists(migrationDir: string) {
  try {
    fs.stat(migrationDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      // TODO: add logger info here
      logger.info("");
      fs.mkdir(migrationDir);
    }
  }
}

async function getNextMigrationId(files, migrationKind: MigrationKind) {
  const migrations = await fs.readdir(files);

  if (migrations.length === 0) {
    return 1;
  }

  const sortedMigrations = migrations
    // figure out if it's `down` or `up` migration
    .filter((migration) => {
      if (migrationKind === "up") {
        return migration.includes(".do.sql");
      }
      if (migrationKind === "down") {
        return migration.includes(".undo.sql");
      }
    })
    .sort((a, b) => +a - +b);

  const latestMigrationVersion = sortedMigrations[sortedMigrations.length - 1];

  return Number(latestMigrationVersion) + 1;
}

async function generateMigrations(
  migrationDir,
  schemaPath,
  migrationKind: MigrationKind
) {
  const command = commandRunner();
  await createMigrationDirectoryIfNotExists(migrationDir);

  const nextMigrationId = await getNextMigrationId(migrationDir, migrationKind);

  switch (migrationKind) {
    case "up":
      const { stdout: upMigrationStdout } = await execaCommand(
        `${command} prisma migrate diff \
         --from-schema-datasource ${schemaPath} \
         --to-schema-datamodel ${schemaPath} \
         --script`
      );

      if (!upMigrationStdout.includes("empty migration")) {
        await fs
          .appendFile(
            `${migrationDir}/${nextMigrationId}.do.sql`,
            upMigrationStdout
          )
          .then(() =>
            logger.success(`🗳 Generated new ${nextMigrationId} up migration`)
          );
      } else {
        logger.info("📭 No new up migration was generated.");
      }
      break;

    case "down":
      const { stdout: downMigrationStdout } = await execaCommand(
        `${command} prisma migrate diff \
         --from-schema-datasource ${schemaPath} \
         --to-schema-datamodel ${schemaPath} \
         --script`
      );
      if (!upMigrationStdout.includes("empty migration")) {
        await fs
          .appendFile(
            `${migrationDir}/${nextMigrationId}.undo.sql`,
            downMigrationStdout
          )
          .then(() =>
            logger.success(`🗳 Generated new ${nextMigrationId} down migration`)
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
