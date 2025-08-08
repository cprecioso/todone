import * as core from "@actions/core";
import dedent from "dedent";
import { dryRun, octokit, repo } from "../../input";
import { partition } from "../util";
import { TODONE_LABEL } from "./common";
import { IssueDefinition } from "./generator";
import { tryGetIssueData } from "./issue-data";

export const fetchCurrentIssues = async () => {
  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    ...repo,
    state: "open",
    labels: TODONE_LABEL,
  });

  core.debug(`Found ${issues.length} open issues with label ${TODONE_LABEL}`);

  const { trues: valid, falses: invalid } = partition(
    issues.map((issue) => {
      const issueData = issue.body && tryGetIssueData(issue.body);
      return issueData
        ? ({ type: "valid", issue, issueData } as const)
        : ({ type: "invalid", issue } as const);
    }),
    <T extends { type: string }>(item: T): item is T & { type: "valid" } =>
      item.type === "valid",
  );

  core.debug(
    `Found ${valid.length} valid issues and ${invalid.length} invalid issues.`,
  );

  return { valid, invalid };
};

const closeWithComment = async (
  issueNumber: number,
  comment: string,
  state_reason?: "completed" | "not_planned" | "reopened",
) => {
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
};

export const closeInvalid = async (number: number) => {
  if (dryRun) {
    core.info(`Would close issue #${number} due to invalid ID.`);
    return;
  }

  await closeWithComment(
    number,
    dedent`
          This issue has no valid ID recognized by todone, and will be closed.
          If this is an error, please remove the label \`${TODONE_LABEL}\` from this issue and re-open it.
        `,
    "not_planned",
  );
  core.info(`Closed issue #${number} due to invalid ID.`);
};

export const closeCompleted = async (number: number) => {
  if (dryRun) {
    core.info(`Would close issue #${number} as completed.`);
    return;
  }

  await closeWithComment(
    number,
    "The TODO that opened this issue does not appear in the codebase anymore, and it will be closed as completed.",
    "completed",
  );
  core.info(`Closed issue #${number} as completed.`);
};

export const createIssue = async ({ title, body }: IssueDefinition) => {
  if (dryRun) {
    core.info(`Would create issue with title: ${title}`);
    return;
  }

  const createdIssue = await octokit.rest.issues.create({
    ...repo,
    title,
    body,
    labels: [TODONE_LABEL],
  });
  core.info(`Created issue #${createdIssue.data.number} ${title}`);
  return createdIssue.data.number;
};

export const updateIssue = async (
  number: number,
  { body }: IssueDefinition,
) => {
  if (dryRun) {
    core.info(`Would update issue #${number}`);
    return;
  }

  const updatedIssue = await octokit.rest.issues.update({
    ...repo,
    issue_number: number,
    body,
  });
  core.info(`Updated issue #${number} ${updatedIssue.data.title}`);
  return updatedIssue.data.number;
};
