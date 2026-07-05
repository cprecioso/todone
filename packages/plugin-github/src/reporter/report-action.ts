import * as core from "@actions/core";
import { Factory, Reporter } from "todone/plugin";
import * as pkg from "../../package.json" with { type: "json" };
import { loadContext } from "./context";
import { logFile, logMatch, logResult } from "./logger";
import { RowData, writeSummary } from "./summary/component";

/**
 * Reporter that prints each analyzed item to the log and writes a GitHub
 * Actions job summary, using the Actions toolkit. Local only: it never calls
 * the GitHub REST API.
 */
export const reportActionReporter: Factory<Reporter> = {
  id: `${pkg.name}/report-action`,
  make: async () => {
    const context = loadContext();
    const rows: RowData[] = [];

    return {
      info: async (message) => core.info(message),
      debug: async (message) => core.debug(message),

      reportFile: async (file) => logFile(file),

      reportMatch: async (match) => logMatch(match),

      reportResult: async (result) => {
        logResult(result);
        rows.push({
          match: result.match,
          url: result.url.toString(),
          result: result.result ?? undefined,
        });
      },

      // Runs at the end of the `await using` scope in the run command, after
      // every row has been accumulated.
      async [Symbol.asyncDispose]() {
        try {
          await writeSummary(context, {
            heading: "TODOs found",
            columns: ["file", "url", "expired", "expirationDate"],
            rows,
          });
        } catch (error) {
          core.warning(`Failed to write summary: ${error}`);
        }
      },
    };
  },
};
