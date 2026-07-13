# @todone/plugin-github

A {@link todone} plugin that will alert you when an GitHub issue or pull request has been resolved.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import githubPlugin from "@todone/plugin-github";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [githubPlugin()],
});
```

Out of the box, the plugin checks whether the GitHub issue, pull request, or milestone a TODO points at has been resolved. The `actions` and `createIssues` options turn on extra features, all meant for GitHub Actions.

## Options

- `token`: The GitHub API token to use for authentication. You can generate a personal access token from your GitHub account settings. Defaults to the `GITHUB_TOKEN` environment variable.

  Without a token, the plugin still works for public repositories (subject to GitHub's unauthenticated rate limits) and emits a warning when created. Checking a URL that requires authentication (e.g. a private repository) without a token fails with an error explaining that a token may be required. `createIssues` requires a token; enabling it without one throws when the plugin is created.

- `context`: The pieces of GitHub context used to build file permalinks and issue links. Every field defaults to the standard GitHub Actions environment variable, so no configuration is needed in CI.

  - `context.repository`: The repository the run belongs to, in the `owner/repo` format. Used to link files and issues in the job summary, and as the repository to sync issues against. Defaults to the `GITHUB_REPOSITORY` environment variable. Without it, the job summary falls back to plain file locations; if `createIssues` is enabled, the run fails with an error when the issue sync starts.
  - `context.server`: The GitHub server to link against. Defaults to the `GITHUB_SERVER_URL` environment variable, or `https://github.com`.
  - `context.sha`: The commit SHA to build file permalinks from. Defaults to the `GITHUB_SHA` environment variable. Without it, the job summary falls back to plain file locations.

- `actions`: Options for the GitHub Actions toolkit (`@actions/core`) integrations. Both default to `true` when running inside GitHub Actions (that is, when `GITHUB_ACTIONS` is set) and to `false` otherwise, so they work with no configuration in CI while staying quiet locally. Set them explicitly to force them on or off.

  - `actions.logger`: Log every message and analyzed item using the Actions toolkit.
  - `actions.summary`: Write a job summary of the results. Makes no GitHub REST API calls.

- `createIssues` (default `false`): Reconcile expired TODOs against the open `todone`-labeled issues, creating, updating, and closing issues as needed. Requires a token. When enabled, the job summary gains an issue and an action column describing what happened to each TODO. Pass `true`, or an object with options:

  - `createIssues.label` (default `"todone"`): Issues with this label are managed by the plugin.

For example, to keep a set of issues in sync with your expired TODOs from a GitHub Actions workflow:

```ts
import githubPlugin from "@todone/plugin-github";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [githubPlugin({ createIssues: true })],
});
```

File permalinks and issue links are built from the `context` options and their GitHub Actions environment variable defaults (`GITHUB_REPOSITORY`, `GITHUB_SERVER_URL`, `GITHUB_SHA`); when those are absent, the plugin falls back to plain file locations.

## Usage

Add a `@TODO` comment with a link to a GitHub issue or pull request:

```js
/*
  @TODO https://github.com/org/repo/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```
