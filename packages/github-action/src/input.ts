import * as core from "@actions/core";
import * as github from "@actions/github";

export const githubToken = core.getInput("github-token", { required: true });
export const globs = core.getInput("globs", { required: true });
export const dryRun = core.getBooleanInput("dry-run");
export const keyword = core.getInput("keyword", { required: true });

// This is a workaround for an un-portable export, which is not an issue because
// this file is only used in this package and not exported externally.
type Octokit = InstanceType<typeof import("@actions/github/lib/utils").GitHub>;
export const octokit: Octokit = github.getOctokit(githubToken);

export const server = github.context.serverUrl;
export const repo = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
};
export const { sha } = github.context;
