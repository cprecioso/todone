import * as core from "@actions/core";
import { AnalysisItem } from "@todone/core";

export const makeDebugLogger = () => (item: AnalysisItem) =>
  core.debug("Found: " + JSON.stringify(item, null, 2));

export const makeResultLogger = () => async (item: AnalysisItem) => {
  if (item.type !== "result") return;

  const {
    result: { url, matches, result },
  } = item;

  const infoLines = result
    ? [
        result.title || "No title",
        result.isExpired ? "Expired" : "Not expired",
        result.expirationDate?.toISOString() || "No expiration date",
      ]
    : ["No plugin responded"];

  const fileLines = matches.map(
    ({ file, position: { line, column } }) => `${file}:${line}:${column}`,
  );

  core.info(
    `Found: ${url}\n` +
      [...infoLines, ...fileLines].map((line) => `\t${line}\n`).join(""),
  );
};
