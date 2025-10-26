import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as pkg from "../../../package.json" with { type: "json" };
import { octokit, repo } from "../../input";
import { TODONE_LABEL } from "./common";
import { IssueDefinition } from "./generator";

export type GitHubIssue = Stream.Stream.Success<
  ReturnType<GitHubAPI["fetchCurrentIssues"]>
>;

export class GitHubAPI extends Effect.Service<GitHubAPI>()(
  `${pkg.name}/GitHubAPI`,
  {
    effect: Effect.gen(function* () {
      const modifyMutex = yield* Effect.makeSemaphore(1);

      const closeWithComment = (
        issueNumber: number,
        comment: string,
        state_reason?: "completed" | "not_planned" | "reopened",
      ) =>
        pipe(
          Effect.tryPromise(async () => {
            await octokit.rest.issues.createComment({
              ...repo,
              issue_number: issueNumber,
              body: comment,
            });

            await octokit.rest.issues.update({
              ...repo,
              issue_number: issueNumber,
              state: "closed",
              state_reason,
            });
          }),
          modifyMutex.withPermits(1),
        );

      return {
        fetchCurrentIssues: (limit = 100) => {
          return pipe(
            Stream.fromAsyncIterable(
              octokit.paginate.iterator(octokit.rest.issues.listForRepo, {
                ...repo,
                state: "open",
                labels: TODONE_LABEL,
                per_page: Math.min(limit, 100),
              }),
              (e) =>
                new Error("Failed to fetch issues from GitHub", { cause: e }),
            ),
            Stream.mapConcat((page) => page.data),
            Stream.take(limit),
          );
        },

        closeInvalid: (number: number) =>
          Effect.gen(function* () {
            yield* closeWithComment(
              number,
              [
                `This issue has no valid ID recognized by todone, and will be closed.`,
                `If this is an error, please remove the label \`${TODONE_LABEL}\` from this issue and re-open it.`,
              ].join("\n"),
              "not_planned",
            );
            core.info(`Closed issue #${number} due to invalid ID.`);
          }),

        closeCompleted: (number: number) =>
          Effect.gen(function* () {
            yield* closeWithComment(
              number,
              "The TODO that opened this issue does not appear in the codebase anymore, and it will be closed as completed.",
              "completed",
            );
            core.info(`Closed issue #${number} as completed.`);
          }),

        createIssue: ({ title, body }: IssueDefinition) =>
          Effect.gen(function* () {
            const createdIssue = yield* pipe(
              Effect.tryPromise(() =>
                octokit.rest.issues.create({
                  ...repo,
                  title,
                  body,
                  labels: [TODONE_LABEL],
                }),
              ),
              modifyMutex.withPermits(1),
            );
            core.info(`Created issue #${createdIssue.data.number} ${title}`);
            return createdIssue.data.number as number | undefined;
          }),

        updateIssue:
          (number: number) =>
          ({ body }: IssueDefinition) =>
            Effect.gen(function* () {
              const updatedIssue = yield* pipe(
                Effect.tryPromise(() =>
                  octokit.rest.issues.update({
                    ...repo,
                    issue_number: number,
                    body,
                  }),
                ),
                modifyMutex.withPermits(1),
              );
              core.info(`Updated issue #${number} ${updatedIssue.data.title}`);
            }),
      };
    }),
  },
) {
  static DryRun = Layer.map(GitHubAPI.Default, (api) => ({
    ...api,
    createIssue: ({ title, body }: IssueDefinition) =>
      Effect.sync(() => {
        core.info(
          `[Dry run] Would create issue "${title}" with body:\n${body}`,
        );
      }),

    updateIssue: (number: number, { body }: IssueDefinition) =>
      Effect.sync(() => {
        core.info(
          `[Dry run] Would update issue #${number} with body:\n${body}`,
        );
      }),

    closeInvalid: (number: number) =>
      Effect.sync(() => {
        core.info(`[Dry run] Would close issue #${number} as invalid.`);
      }),

    closeCompleted: (number: number) =>
      Effect.sync(() => {
        core.info(`[Dry run] Would close issue #${number} as completed.`);
      }),
  }));
}
