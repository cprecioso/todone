import * as it from "@cprecioso/async-iterable-helpers";
import { Octokit } from "octokit";
import { PluginContext } from "todone/plugin";
import { GitHubContext } from "../context";
import { CreateIssuesOptions } from "../options";
import { IssueDefinition } from "./generator";

export interface RemoteIssue {
  number: number;
  body?: string | null;
}

export const makeGitHubAPI = ({
  client,
  context: { repository: repo },
  options: { label },
  pluginCtx: { info },
}: {
  client: Octokit;
  context: GitHubContext;
  options: CreateIssuesOptions;
  pluginCtx: PluginContext;
}) => {
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
    fetchCurrentIssues: (): AsyncIterable<RemoteIssue> => {
      return it
        .from(
          client.paginate.iterator(client.rest.issues.listForRepo, {
            ...repo,
            state: "open",
            labels: label,
            per_page: 100,
          }),
        )
        .pipe(it.flatMap((page) => page.data))
        .pipe(it.filter((issue) => !issue.pull_request));
    },

    closeInvalid: async (number: number) => {
      await closeWithComment(
        number,
        [
          `This issue has no valid ID recognized by todone, and will be closed.`,
          `If this is an error, please remove the label \`${label}\` from this issue and re-open it.`,
        ].join("\n"),
        "not_planned",
      );
      info(`Closed issue #${number} due to invalid ID.`);
    },

    closeCompleted: async (number: number) => {
      await closeWithComment(
        number,
        "The TODO that opened this issue does not appear in the codebase anymore, and it will be closed as completed.",
        "completed",
      );
      info(`Closed issue #${number} as completed.`);
    },

    createIssue: async ({
      title,
      body,
    }: IssueDefinition): Promise<number | undefined> => {
      const createdIssue = await client.rest.issues.create({
        ...repo,
        title,
        body,
        labels: [label],
      });
      info(`Created issue #${createdIssue.data.number} ${title}`);
      return createdIssue.data.number;
    },

    updateIssue: async (number: number, { body }: IssueDefinition) => {
      const updatedIssue = await client.rest.issues.update({
        ...repo,
        issue_number: number,
        body,
      });
      info(`Updated issue #${number} ${updatedIssue.data.title}`);
    },
  };
};

export type GitHubAPI = ReturnType<typeof makeGitHubAPI>;
