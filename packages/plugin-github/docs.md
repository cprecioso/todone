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

Out of the box, the plugin checks whether the GitHub issue, pull request, or milestone a TODO points at has been resolved. The `summary` and `createIssues` options turn on two extra features, both meant for GitHub Actions.

## Options

- `token`: The GitHub API token to use for authentication. You can generate a personal access token from your GitHub account settings. Defaults to the `GITHUB_TOKEN` environment variable.

  Without a token, the plugin still works for public repositories (subject to GitHub's unauthenticated rate limits) and emits a warning when created. Checking a URL that requires authentication (e.g. a private repository) without a token fails with an error explaining that a token may be required.

- `repository`: The repository the run belongs to, in the `owner/repo` format. Used to link files and issues in the job summary, and as the repository to sync issues against. Defaults to the `GITHUB_REPOSITORY` environment variable.

  Without it, the job summary falls back to plain file locations, and the issue sync is skipped with a warning.

- `summary`: Log every analyzed item to the GitHub Actions log, and write a job summary of the results, using the Actions toolkit (`@actions/core`). Makes no GitHub REST API calls.

  Defaults to `true` when running inside GitHub Actions (that is, when `GITHUB_ACTIONS` is set), and to `false` otherwise, so it works with no configuration in CI while staying quiet locally. Set it explicitly to force it on or off.

- `createIssues` (default `false`): Reconcile expired TODOs against the open `todone`-labeled issues, creating, updating, and closing issues as needed. Requires a token, unless `dryRun` is set. When enabled, the job summary gains an issue and an action column describing what happened to each TODO.

- `dryRun` (default `false`): When `true`, issue mutations are logged but never sent to GitHub. Only meaningful together with `createIssues`.

For example, to keep a set of issues in sync with your expired TODOs from a GitHub Actions workflow:

```ts
import githubPlugin from "@todone/plugin-github";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [githubPlugin({ createIssues: true })],
});
```

File permalinks and issue links are built from the `repository` option and the standard GitHub Actions environment variables (`GITHUB_SERVER_URL`, `GITHUB_SHA`); when those are absent, the plugin falls back to plain file locations.

## Usage

Add a `@TODO` comment with a link to a GitHub issue or pull request:

```js
/*
  @TODO https://github.com/org/repo/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```
