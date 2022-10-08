import chalk from "chalk";

const log = console.log;

export default {
  error: (message) => log(chalk.red(message)),
  info: (message) => log(chalk.yellow(message)),
  warn: (message) => log(chalk.white(message)),
  success: (message) => log(chalk.green(message)),
};
