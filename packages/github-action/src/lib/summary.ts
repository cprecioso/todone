import * as core from "@actions/core";
import { AnalysisItem } from "@todone/core";
import { GitHubFile } from "./files";

export const makeSummary = async (items: AnalysisItem<GitHubFile>[]) => {
  await core.summary
    .addHeading("TODOs found")
    .addTable([
      ["File", "Line", "Column", "URL", "Expired", "Expiration Date"].map(
        (data) => ({ data: data, header: true }),
      ),
      ...items
        .filter((item) => item.type === "result")
        .flatMap(({ result: { url, result, matches } }) =>
          matches.map((match) => [
            match.file.location,
            match.position.line.toString(),
            match.position.column.toString(),
            url.toString(),
            result ? (result.isExpired ? "❗" : "⌛") : "",
            result
              ? result.expirationDate?.toISOString() || "No expiration date"
              : "",
          ]),
        ),
    ])
    .write();
};
