import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import { Octokit } from "octokit";
import { TODONE_LABEL } from "./common";
import { IssueDefinition } from "./generator";

export interface RemoteIssue {
  number: number;
  body?: string | null;
}

export interface GitHubAPIOptions {
  client: Octokit;
  repo: { owner: string; repo: string };
  /** When true, issue mutations are logged but never sent to GitHub. */
  dryRun: boolean;
  /** Sink for human-facing progress messages (e.g. `core.info`). */
  log: (message: string) => Effect.Effect<void>;
}

export const makeGitHubAPI = ({
  client,
  repo,
  dryRun,
  log,
}: GitHubAPIOptions) =>
  Effect.gen(function* () {
    const modifyMutex = yield* Effect.makeSemaphore(1);

    const closeWithComment = (
      issueNumber: number,
      comment: string,
      state_reason?: "completed" | "not_planned" | "reopened",
    ) =>
      pipe(
        Effect.tryPromise(async () => {
          await client.rest.issues.createComment({
            ...repo,
            issue_number: issueNumber,
            body: comment,
          });

          await client.rest.issues.update({
            ...repo,
            issue_number: issueNumber,
            state: "closed",
            state_reason,
          });
        }),
        modifyMutex.withPermits(1),
      );

    return {
      fetchCurrentIssues: (
        limit = 100,
      ): Effect.Effect<RemoteIssue[], unknown> =>
        pipe(
          Effect.tryPromise(() =>
            client.paginate(client.rest.issues.listForRepo, {
              ...repo,
              state: "open",
              labels: TODONE_LABEL,
              per_page: Math.min(limit, 100),
            }),
          ),
          Effect.map((issues) => issues.slice(0, limit)),
        ),

      closeInvalid: (number: number) =>
        dryRun
          ? log(`[Dry run] Would close issue #${number} as invalid.`)
          : Effect.gen(function* () {
              yield* closeWithComment(
                number,
                [
                  `This issue has no valid ID recognized by todone, and will be closed.`,
                  `If this is an error, please remove the label \`${TODONE_LABEL}\` from this issue and re-open it.`,
                ].join("\n"),
                "not_planned",
              );
              yield* log(`Closed issue #${number} due to invalid ID.`);
            }),

      closeCompleted: (number: number) =>
        dryRun
          ? log(`[Dry run] Would close issue #${number} as completed.`)
          : Effect.gen(function* () {
              yield* closeWithComment(
                number,
                "The TODO that opened this issue does not appear in the codebase anymore, and it will be closed as completed.",
                "completed",
              );
              yield* log(`Closed issue #${number} as completed.`);
            }),

      createIssue: ({
        title,
        body,
      }: IssueDefinition): Effect.Effect<number | undefined, unknown> =>
        dryRun
          ? Effect.as(
              log(
                `[Dry run] Would create issue "${title}" with body:\n${body}`,
              ),
              undefined,
            )
          : Effect.gen(function* () {
              const createdIssue = yield* pipe(
                Effect.tryPromise(() =>
                  client.rest.issues.create({
                    ...repo,
                    title,
                    body,
                    labels: [TODONE_LABEL],
                  }),
                ),
                modifyMutex.withPermits(1),
              );
              yield* log(`Created issue #${createdIssue.data.number} ${title}`);
              return createdIssue.data.number as number | undefined;
            }),

      updateIssue: (number: number, { body }: IssueDefinition) =>
        dryRun
          ? log(`[Dry run] Would update issue #${number} with body:\n${body}`)
          : Effect.gen(function* () {
              const updatedIssue = yield* pipe(
                Effect.tryPromise(() =>
                  client.rest.issues.update({
                    ...repo,
                    issue_number: number,
                    body,
                  }),
                ),
                modifyMutex.withPermits(1),
              );
              yield* log(`Updated issue #${number} ${updatedIssue.data.title}`);
            }),
    };
  });

export type GitHubAPI = Effect.Effect.Success<ReturnType<typeof makeGitHubAPI>>;
