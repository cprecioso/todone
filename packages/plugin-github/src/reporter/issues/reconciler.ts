import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import { CheckerResult } from "todone/plugin";
import { Match } from "todone/types";
import { isExpiredResult, Result } from "../util/result";
import { GitHubAPI } from "./actions";
import { getIssueData, IssueData } from "./issue-data";

/**
 * The disposition of a single TODO/issue after comparing the analysis results
 * against the open `todone`-labeled issues. Mirrors the five outcomes of the
 * original streaming reconciler.
 */
export type SyncOutcome = Data.TaggedEnum<{
  LocalOnly: {
    url: string;
    result: CheckerResult;
    matches: readonly Match[];
  };
  RemoteMatched: {
    url: string;
    result: CheckerResult;
    matches: readonly Match[];
    issueNumber: number;
  };
  Orphaned: {
    url: string;
    issueNumber: number;
  };
  Invalid: {
    issueNumber: number;
  };
  NotTriggered: {
    url: string;
    result: Option.Option<CheckerResult>;
    matches: readonly Match[];
  };
}>;

export const SyncOutcome = Data.taggedEnum<SyncOutcome>();

export const reconcile = (api: GitHubAPI, results: readonly Result[]) =>
  Effect.gen(function* () {
    const issues = yield* api.fetchCurrentIssues();

    // Parse each issue body into its embedded todoUrl. Both typed failures and
    // assertion defects (malformed/missing zone) mark the issue as invalid.
    const parsed = yield* Effect.all(
      issues.map((issue) =>
        pipe(
          parseIssueBody(issue.body),
          Effect.catchAllDefect((defect) => Effect.fail(defect)),
          Effect.either,
          Effect.map((either) => ({ issue, data: Either.getRight(either) })),
        ),
      ),
    );

    const validIssues = parsed.flatMap(({ issue, data }) =>
      Option.match(data, {
        onNone: () => [],
        onSome: ({ todoUrl }) => [{ issue, todoUrl }],
      }),
    );
    const invalidIssues = parsed
      .filter(({ data }) => Option.isNone(data))
      .map(({ issue }) => issue);

    const issueByUrl = new Map(validIssues.map((v) => [v.todoUrl, v.issue]));

    const outcomes: SyncOutcome[] = [];
    const expiredUrls = new Set<string>();

    for (const result of results) {
      const url = result.url.toString();

      if (isExpiredResult(result)) {
        expiredUrls.add(url);
        const checkerResult = result.result.value;
        const issue = issueByUrl.get(url);

        outcomes.push(
          issue
            ? SyncOutcome.RemoteMatched({
                url,
                result: checkerResult,
                matches: result.matches,
                issueNumber: issue.number,
              })
            : SyncOutcome.LocalOnly({
                url,
                result: checkerResult,
                matches: result.matches,
              }),
        );
      } else {
        outcomes.push(
          SyncOutcome.NotTriggered({
            url,
            result: result.result,
            matches: result.matches,
          }),
        );
      }
    }

    // Valid issues no longer backed by an expired TODO are orphaned.
    for (const { issue, todoUrl } of validIssues) {
      if (!expiredUrls.has(todoUrl)) {
        outcomes.push(
          SyncOutcome.Orphaned({
            url: todoUrl,
            issueNumber: issue.number,
          }),
        );
      }
    }

    for (const issue of invalidIssues) {
      outcomes.push(
        SyncOutcome.Invalid({
          issueNumber: issue.number,
        }),
      );
    }

    return outcomes;
  });

const parseIssueBody = (
  body: string | null | undefined,
): Effect.Effect<IssueData, unknown> =>
  body ? getIssueData(body) : Effect.fail(new Error("empty issue body"));
