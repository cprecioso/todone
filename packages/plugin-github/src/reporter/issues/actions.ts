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
  log: (message: string) => void;
}

export const makeGitHubAPI = ({
  client,
  repo,
  dryRun,
  log,
}: GitHubAPIOptions) => {
  const closeWithComment = async (
    issueNumber: number,
    comment: string,
    state_reason?: "completed" | "not_planned" | "reopened",
  ) => {
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
  };

  return {
    fetchCurrentIssues: async (limit = 100): Promise<RemoteIssue[]> => {
      const issues = await client.paginate(client.rest.issues.listForRepo, {
        ...repo,
        state: "open",
        labels: TODONE_LABEL,
        per_page: Math.min(limit, 100),
      });
      return issues.slice(0, limit);
    },

    closeInvalid: async (number: number) => {
      if (dryRun) {
        log(`[Dry run] Would close issue #${number} as invalid.`);
        return;
      }

      await closeWithComment(
        number,
        [
          `This issue has no valid ID recognized by todone, and will be closed.`,
          `If this is an error, please remove the label \`${TODONE_LABEL}\` from this issue and re-open it.`,
        ].join("\n"),
        "not_planned",
      );
      log(`Closed issue #${number} due to invalid ID.`);
    },

    closeCompleted: async (number: number) => {
      if (dryRun) {
        log(`[Dry run] Would close issue #${number} as completed.`);
        return;
      }

      await closeWithComment(
        number,
        "The TODO that opened this issue does not appear in the codebase anymore, and it will be closed as completed.",
        "completed",
      );
      log(`Closed issue #${number} as completed.`);
    },

    createIssue: async ({
      title,
      body,
    }: IssueDefinition): Promise<number | undefined> => {
      if (dryRun) {
        log(`[Dry run] Would create issue "${title}" with body:\n${body}`);
        return undefined;
      }

      const createdIssue = await client.rest.issues.create({
        ...repo,
        title,
        body,
        labels: [TODONE_LABEL],
      });
      log(`Created issue #${createdIssue.data.number} ${title}`);
      return createdIssue.data.number;
    },

    updateIssue: async (number: number, { body }: IssueDefinition) => {
      if (dryRun) {
        log(`[Dry run] Would update issue #${number} with body:\n${body}`);
        return;
      }

      const updatedIssue = await client.rest.issues.update({
        ...repo,
        issue_number: number,
        body,
      });
      log(`Updated issue #${number} ${updatedIssue.data.title}`);
    },
  };
};

export type GitHubAPI = ReturnType<typeof makeGitHubAPI>;
