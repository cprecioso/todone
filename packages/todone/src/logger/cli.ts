import { AnalysisItem } from "@todone/core";
import * as t from "@todone/types";
import chalk from "chalk";
import { relative as relativePath } from "node:path";
import type { Writable } from "node:stream";
import { fileURLToPath } from "node:url";

const dateFormatter = new Intl.DateTimeFormat();

const cwd = process.cwd();
const humanFilename = (file: t.File) => {
  if (!file.isPresent) return file.url;
  const url = new URL(file.url);
  if (url.protocol !== "file:") return file.url;
  const path = fileURLToPath(url);
  return path.startsWith(cwd) ? relativePath(cwd, path) : path;
};

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
        file,
        url,
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
