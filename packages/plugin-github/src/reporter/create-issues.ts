import * as core from "@actions/core";
import * as Config from "effect/Config";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as Ref from "effect/Ref";
import { Factory, Reporter } from "todone/plugin";
import * as pkg from "../../package.json" with { type: "json" };
import { GitHub } from "../common";
import { ActionContext, loadContext } from "./context";
import { makeGitHubAPI } from "./issues/actions";
import { generateIssue } from "./issues/generator";
import { reconcile, SyncOutcome } from "./issues/reconciler";
import { RowData, writeSummary } from "./summary/component";
import { Result } from "./util/result";

const info = (message: string) => Effect.sync(() => core.info(message));

/**
 * Reporter that reconciles expired TODOs against the open `todone`-labeled
 * issues and creates/updates/closes them via the GitHub REST API, then writes a
 * job summary describing what happened. Honors a `dryRun` plugin option.
 */
export const createIssuesReporter: Factory<Reporter> = {
  id: `${pkg.name}/create-issues`,
  create: () =>
    pipe(
      Effect.gen(function* () {
        const context = yield* loadContext;
        const { client } = yield* GitHub;
        const dryRun = yield* Config.withDefault(
          Config.boolean("dryRun"),
          false,
        );

        const resultsRef = yield* Ref.make<Result[]>([]);

        const sync = (repo: { owner: string; repo: string }) =>
          Effect.gen(function* () {
            const results = yield* Ref.get(resultsRef);
            const api = yield* makeGitHubAPI({
              client,
              repo,
              dryRun,
              log: info,
            });
            const outcomes = yield* reconcile(api, results);

            const rows: RowData[] = [];

            const pushMatchRows = (
              outcome: Data.TaggedEnum.Value<
                SyncOutcome,
                "LocalOnly" | "RemoteMatched" | "NotTriggered"
              >,
              actionMessage: string,
              issueNumber?: number,
            ) => {
              const result = SyncOutcome.$is("NotTriggered")(outcome)
                ? Option.getOrUndefined(outcome.result)
                : outcome.result;
              for (const match of outcome.matches) {
                rows.push({
                  match,
                  url: outcome.url,
                  result,
                  issueNumber,
                  actionMessage,
                });
              }
            };

            for (const outcome of outcomes) {
              yield* SyncOutcome.$match(outcome, {
                LocalOnly: (outcome) =>
                  Effect.gen(function* () {
                    const issueNumber = yield* api.createIssue(
                      generateIssue(context, {
                        url: new URL(outcome.url),
                        result: outcome.result,
                        matches: outcome.matches,
                      }),
                    );
                    pushMatchRows(outcome, "Created", issueNumber);
                  }),

                RemoteMatched: (outcome) =>
                  Effect.gen(function* () {
                    yield* api.updateIssue(
                      outcome.issueNumber,
                      generateIssue(context, {
                        url: new URL(outcome.url),
                        result: outcome.result,
                        matches: outcome.matches,
                      }),
                    );
                    pushMatchRows(outcome, "Updated", outcome.issueNumber);
                  }),

                Orphaned: (outcome) =>
                  Effect.gen(function* () {
                    yield* api.closeCompleted(outcome.issueNumber);
                    rows.push({
                      url: outcome.url,
                      issueNumber: outcome.issueNumber,
                      actionMessage: "Closed (completed)",
                    });
                  }),

                Invalid: (outcome) =>
                  Effect.gen(function* () {
                    yield* api.closeInvalid(outcome.issueNumber);
                    rows.push({
                      issueNumber: outcome.issueNumber,
                      actionMessage: "Closed (invalid)",
                    });
                  }),

                NotTriggered: (outcome) =>
                  Effect.gen(function* () {
                    pushMatchRows(outcome, "Waiting");
                  }),
              });
            }

            yield* writeSummary(context, {
              heading: "TODOs found",
              columns: [
                "file",
                "url",
                "expired",
                "expirationDate",
                "issue",
                "action",
              ],
              rows,
            });
          });

        const runSync = (context: ActionContext) =>
          Option.match(context.repo, {
            onNone: () =>
              Effect.sync(() =>
                core.warning(
                  "GITHUB_REPOSITORY is not set; skipping GitHub issue sync.",
                ),
              ),
            onSome: (repo) =>
              pipe(
                sync(repo),
                Effect.catchAll((error) =>
                  Effect.sync(() =>
                    core.error(`Failed to sync issues: ${error}`),
                  ),
                ),
              ),
          });

        // Bound to the command scope opened by `Effect.scoped`, so it fires once at
        // end of run after every result has been accumulated.
        yield* Effect.addFinalizer(() => runSync(context));

        const plugin: Reporter = {
          info,
          debug: (message) => Effect.sync(() => core.debug(message)),

          reportFile: () => Effect.void,
          reportMatch: () => Effect.void,

          reportResult: (result) =>
            Ref.update(resultsRef, (results) => [...results, result]),
        };

        return plugin;
      }),
      Effect.provide(GitHub.Default),
    ),
};
