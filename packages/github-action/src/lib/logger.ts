import * as core from "@actions/core";
import { AnalysisItem } from "@todone/core";
import { concat } from "@todone/internal-util/collection";
import { GitHubFile } from "./files";
import { formatDate } from "./util";

export const makeDebugLogger = () => (item: AnalysisItem<GitHubFile>) =>
  core.debug("Found: " + JSON.stringify(item, null, 2));

export const makeResultLogger =
  () => async (item: AnalysisItem<GitHubFile>) => {
    if (item.type !== "result") return;

    const {
      result: { url, matches, result },
    } = item;

    const infoLines = result
      ? [
          result.title || "No title",
          result.isExpired ? "Expired" : "Not expired",
          result.expirationDate
            ? formatDate(result.expirationDate)
            : "No expiration date",
        ]
      : ["No plugin responded"];

    const fileLines = matches.map(
      ({ file, position: { line, column } }) =>
        `${file.location}:${line}:${column}`,
    );

    core.info(
      `Found: ${url}\n` +
        concat(infoLines, fileLines)
          .map((line) => `\t${line}\n`)
          .reduce((acc, item) => acc + item, ""),
    );
  };
