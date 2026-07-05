import * as core from "@actions/core";
import * as t from "todone/types";
import { formatDate } from "./util/format";

/** Console logging of analyzed items, through the GitHub Actions toolkit. */

export const logFile = (file: t.File) =>
  core.debug(`Found file: ${file.localPath}`);

export const logMatch = (match: t.Match) =>
  core.debug(
    `Found match: ${match.url} at ${match.file.localPath}:${match.position.line}:${match.position.column}`,
  );

export const logResult = ({ url, result, match }: t.Result) => {
  const infoLines = result
    ? [
        result.title || "No title",
        result.isExpired ? "Expired" : "Not expired",
        result.expirationDate
          ? formatDate(result.expirationDate)
          : "No expiration date",
      ]
    : ["No plugin responded"];

  const {
    file,
    position: { line, column },
  } = match;
  const fileLine = `${file.localPath}:${line}:${column}`;

  core.info(
    `Found: ${url}\n` +
      [...infoLines, fileLine].map((line) => `\t${line}\n`).join(""),
  );
};
