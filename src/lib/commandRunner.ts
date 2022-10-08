import { detect } from "detect-package-manager";

async function commandRunner() {
  const pkgManager = await detect();
  let command = "npx";

  switch (pkgManager) {
    case "npm":
      command = "npx";
      break;
    case "yarn":
      command = "yarn";
      break;
    case "pnpm":
      command = "pnpx";
      break;
    default:
      command = "npx";
  }
  return command;
}

export default commandRunner;
