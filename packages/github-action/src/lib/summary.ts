import * as core from "@actions/core";
import { AnalysisItem } from "@todone/core";

export const makeSummary = async (items: AnalysisItem[]) => {
  await core.summary
    .addHeading("TODOs found")
    .addTable([
      ["File", "Line", "Column", "URL", "Expired", "Expiration Date"].map(
        (data) => ({ data: data, header: true }),
      ),
      ...items
        .filter((item) => item.type === "result")
        .map(
          ({
            item: {
              match: {
                file,
                start: { line, column },
                url,
              },
              result,
            },
          }) => [
            file.location,
            line.toString(),
            column.toString(),
            url.toString(),
            result ? (result.isExpired ? "Yes" : "No") : "",
            result
              ? result.expirationDate?.toISOString() || "No expiration date"
              : "",
          ],
        ),
    ])
    .write();
};
