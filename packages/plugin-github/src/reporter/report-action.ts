import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as Ref from "effect/Ref";
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
  create: () =>
    Effect.gen(function* () {
      const context = yield* loadContext;

      const rowsRef = yield* Ref.make<RowData[]>([]);

      // Bound to the command scope opened by `Effect.scoped`, so it fires once
      // at end of run after every row has been accumulated.
      yield* Effect.addFinalizer(() =>
        pipe(
          Ref.get(rowsRef),
          Effect.flatMap((rows) =>
            writeSummary(context, {
              heading: "TODOs found",
              columns: ["file", "url", "expired", "expirationDate"],
              rows,
            }),
          ),
          Effect.catchAll((error) =>
            Effect.sync(() =>
              core.warning(`Failed to write summary: ${error}`),
            ),
          ),
        ),
      );

      const plugin: Reporter = {
        info: (message) => Effect.sync(() => core.info(message)),
        debug: (message) => Effect.sync(() => core.debug(message)),

        reportFile: (file) => logFile(file),

        reportMatch: (match) => logMatch(match),

        reportResult: (result) =>
          Effect.gen(function* () {
            yield* logResult(result);
            yield* Ref.update(rowsRef, (rows) => [
              ...rows,
              ...result.matches.map(
                (match): RowData => ({
                  match,
                  url: result.url.toString(),
                  result: Option.getOrUndefined(result.result),
                }),
              ),
            ]);
          }),
      };

      return plugin;
    }),
};
