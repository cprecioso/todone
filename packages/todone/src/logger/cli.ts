import { AnalysisItem } from "@todone/core";
import chalk from "chalk";
import type { Writable } from "node:stream";

const dateFormatter = new Intl.DateTimeFormat();

const cwd = process.cwd();

export const logCLIReports = async (
  stdout: Writable,
  reports: AsyncIterable<AnalysisItem>,
) => {
  const headerLn = (str = "") => stdout.write(`${str}\n`);
  const infoLn = (str = "") => stdout.write(`\t${str}\n`);

  let counters = {
    files: 0,
    matches: 0,
    results: 0,
    expiredResults: 0,
  };

  for await (const report of reports) {
    if (report.type === "file") counters.files++;
    if (report.type === "match") counters.matches++;
    if (report.type === "result") counters.results++;

    if (report.type !== "result") continue;

    const {
      result,
      match: {
        file: { location },
        url,
        start: { line, column },
      },
    } = report.item;

    headerLn(
      chalk.blueBright(location) +
        ":" +
        chalk.yellowBright(line) +
        ":" +
        chalk.yellowBright(column),
    );
    infoLn(chalk.bold(url));

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

      if (isExpired) counters.expiredResults++;
    }

    headerLn();
  }

  process.stdout.write(`
Analysis complete:
${counters.files} files found
${counters.matches} matches found
${counters.results} results found
${counters.expiredResults} expired results found
`);

  return counters;
};
