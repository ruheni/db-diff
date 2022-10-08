import { execaCommand } from "execa";
import fs from "fs/promises";
import commandRunner from "./commandRunner";
import logger from "./logger";

type MigrationKind = "up" | "down";

async function generateMigrationFile(
  migrationDir,
  migrationId,
  kind: MigrationKind
) {
  try {
    const command = commandRunner();

    switch (kind) {
      case "up":
        const { stdout: upMigrationStdout } = await execaCommand(
          `${command} prisma migrate diff \
           --from-schema-datasource ./prisma/schema.prisma \
           --to-schema-datamodel ./prisma/schema.prisma 
           --script`
        );

        if (!upMigrationStdout.includes("empty migration")) {
          // TODO
          logger.info("");
          await fs.appendFile(
            `${migrationDir}/${migrationId}.undo.sql`,
            upMigrationStdout
          ).then(() => logger.success(`🗳 Generated new ${migrationId} up migration`));
        } else {
          logger.info("📭 No new up migration was generated.");
        }

        break;

      case "down":
        const { stdout: downMigrationStdout } = await execaCommand(
          `${command} prisma migrate diff \
           --from-schema-datasource ./prisma/schema.prisma \
           --to-schema-datamodel ./prisma/schema.prisma 
           --script`
        );
        if (!upMigrationStdout.includes("empty migration")) {
          await fs.appendFile(
            `${migrationDir}/${migrationId}.do.sql`,
            downMigrationStdout
          ).then(() => logger.success(`🗳 Generated new ${migrationId} down migration`))

        } else {
          logger.info("📭 No new down migration was generated.");
        }
        break;

      default:
        break;
    }
  } catch (error) {
    logger.error("");
  }
}

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

async function getNextMigrationId(files) {
  const migrations = await fs.readdir(files);

  if (migrations.length === 0) {
    return 1;
  }

  const sortedMigrations = migrations
    .filter((migration) => migration.includes(".do.sql"))
    .sort((a, b) => +a - +b);

  const latestMigrationVersion = sortedMigrations[sortedMigrations.length - 1];

  return Number(latestMigrationVersion) + 1;
}

async function generateMigrations(migrationDir, migrationKind: MigrationKind) {
  await createMigrationDirectoryIfNotExists(migrationDir);
  const files = await fs.readdir(migrationDir);

  const nextMigrationId = await getNextMigrationId(files);

  switch (migrationKind) {
    case "up":
      await generateMigrationFile(migrationDir, nextMigrationId, "up")
      break;
    case "down":
      await generateMigrationFile(migrationDir, nextMigrationId, "down")
      break;
    default:
      break;
  }
}

export default generateMigrations;