import logger from "./lib/logger";
import generateMigrations from "./lib/migration";
import CLI from "./cli";

async function main() {
  const { migrationsDir, schema, up, down } = CLI();

  if (up) {
    await generateMigrations(migrationsDir, schema, "up");
  } else if (down) {
    await generateMigrations(migrationsDir, schema, "down");
  } else {
    Promise.all([
      await generateMigrations(migrationsDir, schema, "down"),
      await generateMigrations(migrationsDir, schema, "up"),
    ]);
  }
}

main().catch((e) => {
  if (e instanceof Error) {
    logger.error(e.name);
    logger.error(e.message);
  } else {
    logger.error("Oops, something went wrong...");
    console.log(e);
  }
});

export default main;
