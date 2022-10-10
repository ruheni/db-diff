import chalk from "chalk";

const log = console.log;

export default {
  error: (message) => log(chalk.red(message)),
  info: (message) => log(chalk.yellow(message)),
  success: (message) => log(chalk.green(message)),
  gray: (message) => log(chalk.gray(message)),
};
