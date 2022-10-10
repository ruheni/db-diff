import { execaCommand } from "execa";
import fs from "fs/promises";
import logger from "./logger";

type MigrationKind = "up" | "down";

async function createMigrationDirectoryIfNotExists(migrationDir: string) {
  try {
    await fs.stat(migrationDir);
  } catch (error) {
    if (error.code === "ENOENT") {
      logger.info(`Creating your migration folder in ${migrationDir}`);
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

  const nextMigrationId = await getNextMigrationId(
    migrationDir,
    migrationKind,
  ).then((value) => value?.toString().padStart(3, "0"));

  switch (migrationKind) {
    case "up": {
      const { exitCode, stdout } = await execaCommand(
        `npx prisma migrate diff \
         --from-schema-datasource ${schemaPath} \
         --to-schema-datamodel ${schemaPath} \
         --script`,
      );

      if (exitCode === 2) {
        await fs
          .writeFile(`${migrationDir}/${nextMigrationId}.do.sql`, stdout)
          .then(() =>
            logger.success(
              `🗳 Generated ${nextMigrationId}.do.sql up migration`,
            ),
          );
      } else if (exitCode === 0) {
        logger.gray("📭 No new up migration was generated.");
      } else {
        logger.error(`Oops, something went wrong: 
        ${stdout}
        `)
      }
      break;
    }

    case "down": {
      const { exitCode, stdout } = await execaCommand(
        `npx prisma migrate diff \
        --from-schema-datamodel ${schemaPath} \
        --to-schema-datasource ${schemaPath} \
         --script`,
      );

      if (exitCode === 2) {
        await fs
          .appendFile(`${migrationDir}/${nextMigrationId}.undo.sql`, stdout)
          .then(() =>
            logger.success(
              `🗳 Generated new ${nextMigrationId}.undo.sql down migration`,
            ),
          );
      } else if (exitCode === 0) {
        logger.gray("📭 No new down migration was generated.");
      } else {
        logger.error(`Oops, something went wrong: 
        ${stdout}
        `)
      }
      break;
    }
    default:
      break;
  }
}

export default generateMigrations;
