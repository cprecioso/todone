import { InflightReports } from "@todone/core";
import chalk from "chalk";
import type { Writable } from "node:stream";

const dateFormatter = new Intl.DateTimeFormat();

export const logCLIReports = async (
  stdout: Writable,
  reports: AsyncIterable<InflightReports>
) => {
  const headerLn = (str = "") => stdout.write(`${str}\n`);
  const infoLn = (str = "") => stdout.write(`\t${str}\n`);

  let expiredReports = 0;

  for await (const report of reports) {
    if (report.type !== "result") continue;

    const {
      result,
      match: {
        file,
        url: { href },
        start: { line, column },
      },
    } = report.item;

    headerLn(
      chalk.blueBright(file) +
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

      if (isExpired) expiredReports++;
    }

    headerLn();
  }

  return expiredReports;
};
