import logger from "./lib/logger";
import generateMigrations from "./lib/migration";

async function main() {
  generateMigrations("migrations", "up")
  generateMigrations("migrations", "down")
}

main().catch((e) => {
  if (e instanceof Error) {
    logger.error(e);
  } else {
    logger.error("Oops, something went wrong...");
    console.log(e);
  }
  if (!process.env.VITEST) {
    process.exit(1);
  }
});

export default main;
