import * as core from "@actions/core";
import * as github from "@actions/github";

export const githubToken = core.getInput("github-token", { required: true });
export const globs = core.getInput("globs", { required: true });
export const dryRun = core.getBooleanInput("dry-run");
export const keyword = core.getInput("keyword", { required: true });

export const octokit = github.getOctokit(githubToken);

export const server = github.context.serverUrl;
export const repo = {
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
};
export const { sha } = github.context;
