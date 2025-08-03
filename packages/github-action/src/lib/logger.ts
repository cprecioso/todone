import * as core from "@actions/core";
import { AnalysisItem } from "@todone/core";

export const makeDebugLogger = () => (item: AnalysisItem) =>
  core.debug("Found: " + JSON.stringify(item, null, 2));

export const makeResultLogger = () => async (item: AnalysisItem) => {
  if (item.type !== "result") return;

  const {
    item: {
      match: {
        url,
        file: { location },
        start: { line, column },
      },
      result,
    },
  } = item;

  const infoLines = result
    ? [
        url.toString(),
        result.isExpired ? "Expired" : "Not expired",
        result.expirationDate?.toISOString() || "No expiration date",
      ]
    : [url.toString(), "No plugin responded"];

  core.info(
    `Found match at ${location}:${line}:${column}` +
      infoLines.map((l) => `\n\t${l}`).join(""),
  );
};
