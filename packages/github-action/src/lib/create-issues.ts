import * as github from "@actions/github";
import { AnalysisItem } from "@todone/core";

export const makeIssueCreator = (createIssues: boolean, token: string) => {
  if (!createIssues) return async () => {};

  const octokit = github.getOctokit(token);

  return async (item: AnalysisItem) => {
    if (
      item.type !== "result" ||
      !item.item.result ||
      !item.item.result.isExpired
    )
      return;

    const {
      item: {
        result: { expirationDate },
      },
    } = item;

    await octokit.rest.issues.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      title: `TODO expired`,
      labels: ["todone"],
    });
  };
};
