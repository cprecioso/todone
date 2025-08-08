import * as core from "@actions/core";
import dedent from "dedent";
import { octokit, repo } from "../../input";
import { reconcile } from "../reconciler";
import { partition } from "../util";
import { TODONE_LABEL } from "./common";
import { IssueDefinition } from "./generator";
import { tryGetIssueData } from "./issue-data";

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

export const reconcileIssues = async (desiredIssues: IssueDefinition[]) => {
  const currentIssues = await octokit.paginate(
    octokit.rest.issues.listForRepo,
    { ...repo, state: "open", labels: TODONE_LABEL },
  );

  core.debug(
    `Found ${currentIssues.length} open issues with label ${TODONE_LABEL}`,
  );

  const { trues: validCurrentIssues, falses: invalidCurrentIssues } = partition(
    currentIssues.map((issue) => {
      const issueData = issue.body && tryGetIssueData(issue.body);
      return issueData
        ? ({ type: "valid", issue, issueData } as const)
        : ({ type: "invalid", issue } as const);
    }),
    <T extends { type: string }>(item: T): item is T & { type: "valid" } =>
      item.type === "valid",
  );

  core.debug(
    `Found ${validCurrentIssues.length} valid issues and ${invalidCurrentIssues.length} invalid issues.`,
  );

  for (const {
    issue: { number },
  } of invalidCurrentIssues) {
    await closeWithComment(
      number,
      dedent`
          This issue has no valid ID recognized by todone, and will be closed.
          If this is an error, please remove the label \`${TODONE_LABEL}\` from this issue and re-open it.
        `,
      "not_planned",
    );
    core.info(`Closed issue #${number} due to invalid ID.`);
  }

  const currentIssuesMap = new Map(
    validCurrentIssues.map(({ issue, issueData: { todoUrl: url } }) => [
      url,
      issue,
    ]),
  );

  const desiredIssuesMap = new Map(
    desiredIssues.map((issue) => [issue.todoUrl, issue]),
  );

  const reconciliation = reconcile(currentIssuesMap, desiredIssuesMap, [
    "body",
  ]);

  core.debug(dedent`
      Reconciliation result:
        Added: ${reconciliation.added.size},
        Removed: ${reconciliation.removed.size},
        Changes: ${reconciliation.changes.size}
    `);

  for (const { title, body } of reconciliation.added.values()) {
    const createdIssue = await octokit.rest.issues.create({
      ...repo,
      title,
      body,
      labels: [TODONE_LABEL],
    });
    core.info(`Created issue: #${createdIssue.data.number} ${title}`);
  }

  for (const { number } of reconciliation.removed.values()) {
    await closeWithComment(
      number,
      "The TODO referenced by this issue has been resolved, and it will be closed.",
      "completed",
    );
    core.info(`Closed issue #${number} as resolved.`);
  }

  for (const { current, changes } of reconciliation.changes.values()) {
    if (changes) {
      await octokit.rest.issues.update({
        ...repo,
        issue_number: current.number,
        ...changes,
      });
      core.info(`Updated issue #${current.number}`);
    } else {
      core.debug(`No changes for issue #${current.number}, skipping update.`);
    }
  }
};
