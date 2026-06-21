import * as core from "@actions/core";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as Ref from "effect/Ref";
import { Reporter } from "todone/plugin";
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
export const createIssuesReporter = Effect.gen(function* () {
  const context = yield* loadContext;
  const { client } = yield* GitHub;
  const dryRun = yield* Config.withDefault(Config.boolean("dryRun"), false);

  const resultsRef = yield* Ref.make<Result[]>([]);
  const finalizerRegistered = yield* Ref.make(false);

  const sync = (repo: { owner: string; repo: string }) =>
    Effect.gen(function* () {
      const results = yield* Ref.get(resultsRef);
      const api = yield* makeGitHubAPI({ client, repo, dryRun, log: info });
      const outcomes = yield* reconcile(api, results);

      const rows: RowData[] = [];

      const pushMatchRows = (
        outcome: Extract<
          SyncOutcome,
          { _tag: "LocalOnly" | "RemoteMatched" | "NotTriggered" }
        >,
        actionMessage: string,
        issueNumber?: number,
      ) => {
        const result =
          outcome._tag === "NotTriggered"
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
        switch (outcome._tag) {
          case "LocalOnly": {
            const issueNumber = yield* api.createIssue(
              generateIssue(context, {
                url: new URL(outcome.url),
                result: outcome.result,
                matches: outcome.matches,
              }),
            );
            pushMatchRows(outcome, "Created", issueNumber);
            break;
          }

          case "RemoteMatched": {
            yield* api.updateIssue(
              outcome.issueNumber,
              generateIssue(context, {
                url: new URL(outcome.url),
                result: outcome.result,
                matches: outcome.matches,
              }),
            );
            pushMatchRows(outcome, "Updated", outcome.issueNumber);
            break;
          }

          case "Orphaned": {
            yield* api.closeCompleted(outcome.issueNumber);
            rows.push({
              url: outcome.url,
              issueNumber: outcome.issueNumber,
              actionMessage: "Closed (completed)",
            });
            break;
          }

          case "Invalid": {
            yield* api.closeInvalid(outcome.issueNumber);
            rows.push({
              issueNumber: outcome.issueNumber,
              actionMessage: "Closed (invalid)",
            });
            break;
          }

          case "NotTriggered": {
            pushMatchRows(outcome, "Waiting");
            break;
          }
        }
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
            Effect.sync(() => core.error(`Failed to sync issues: ${error}`)),
          ),
        ),
    });

  const registerFinalizer = Effect.gen(function* () {
    const already = yield* Ref.getAndSet(finalizerRegistered, true);
    if (already) return;
    yield* Effect.addFinalizer(() => runSync(context));
  });

  const plugin: Reporter = {
    id: "github-create-issues",
    name: "GitHub Create Issues",

    info,
    debug: (message) => Effect.sync(() => core.debug(message)),

    reportFile: () => registerFinalizer,
    reportMatch: () => Effect.void,

    reportResult: (result) =>
      Ref.update(resultsRef, (results) => [...results, result]),
  };

  return plugin;
});
