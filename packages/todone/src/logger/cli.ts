import { InflightReports } from "@todone/core";
import { ReportFile } from "@todone/types";
import chalk from "chalk";
import nodePath from "node:path";
import type { Writable } from "node:stream";
import { fileURLToPath } from "node:url";

const dateFormatter = new Intl.DateTimeFormat();

const cwd = process.cwd();
const humanFilename = (file: ReportFile) => {
  if (!file.isPresent) return file.url;
  const url = new URL(file.url);
  if (url.protocol !== "file:") return file.url;
  const path = fileURLToPath(url);
  return path.startsWith(cwd) ? nodePath.relative(cwd, path) : path;
};

export const logCLIReports = async (
  stdout: Writable,
  reports: AsyncIterable<InflightReports>,
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

    const fileName = humanFilename(file);

    headerLn(
      chalk.blueBright(fileName) +
        ":" +
        chalk.yellowBright(line) +
        ":" +
        chalk.yellowBright(column),
    );
    infoLn(chalk.bold(href));

    if (!result) {
      infoLn(chalk.gray("No plugin responded"));
    } else {
      const { isExpired, expirationDate } = result;

      infoLn(
        isExpired
          ? chalk.bgYellow.redBright("EXPIRED")
          : chalk.blue("Not expired yet"),
      );

      if (expirationDate) {
        infoLn(
          [
            isExpired ? "expired" : "will expire",
            "on",
            dateFormatter.format(expirationDate),
          ].join(" "),
        );
      }

      if (isExpired) expiredReports++;
    }

    headerLn();
  }

  return expiredReports;
};
