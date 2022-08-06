import type { Result } from "@todone/types";
import chalk from "chalk";
import type { Writable } from "node:stream";

const dateFormatter = new Intl.DateTimeFormat();

export const logResults = async (
  stdout: Writable,
  results: AsyncIterable<Result>
) => {
  const headerLn = (str = "") => stdout.write(`${str}\n`);
  const infoLn = (str = "") => stdout.write(`\t${str}\n`);

  let expiredResults = 0;

  resultLoop: for await (const {
    result,
    match: {
      file: { relative: filePath },
      url: { href },
      start: { line, column },
    },
  } of results) {
    headerLn(
      chalk.blueBright(filePath) +
        ":" +
        chalk.yellowBright(line) +
        ":" +
        chalk.yellowBright(column)
    );
    infoLn(chalk.bold(href));

    if (!result) {
      infoLn(chalk.gray("No plugin responded"));
    } else {
      const { isExpired, expiration } = result;

      infoLn(
        isExpired
          ? chalk.bgYellow.redBright("EXPIRED")
          : chalk.blue("Not expired yet")
      );

      if (expiration) {
        infoLn(
          [
            isExpired ? "expired" : "will expire",
            expiration.isApproximation ? "around" : "on",
            dateFormatter.format(expiration.date),
          ].join(" ")
        );
      }

      if (isExpired) expiredResults++;
    }

    headerLn();
  }

  return expiredResults;
};
