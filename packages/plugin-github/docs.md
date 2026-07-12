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

## Options

- `token`: The GitHub API token to use for authentication. You can generate a personal access token from your GitHub account settings. Defaults to the `GITHUB_TOKEN` environment variable.

  Without a token, the plugin still works for public repositories (subject to GitHub's unauthenticated rate limits) and emits a warning when created. Checking a URL that requires authentication (e.g. a private repository) without a token fails with an error explaining that a token may be required.

## Reporters

This package also ships two reporters, meant to run inside GitHub Actions. Import them from `@todone/plugin-github/reporters` and add them to the `reporters` config option:

```ts
import githubPlugin from "@todone/plugin-github";
import {
  actionsReporter,
  createIssuesReporter,
} from "@todone/plugin-github/reporters";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [githubPlugin()],
  reporters: [actionsReporter(), createIssuesReporter()],
});
```

- `actionsReporter()`: Prints every analyzed item to the log and writes a job summary (via the GitHub Actions toolkit `@actions/core`). Local only; it makes no GitHub REST API calls.
- `createIssuesReporter(options?)`: Reconciles expired TODOs against the open `todone`-labeled issues and creates, updates, or closes issues accordingly, then writes a job summary describing what happened. Options:
  - `token`: The GitHub API token used to read and mutate issues. Defaults to the `GITHUB_TOKEN` environment variable. Required unless `dryRun` is set.
  - `dryRun` (default `false`): When `true`, issue mutations are logged but never sent to GitHub.

Both build file permalinks and issue links from the standard GitHub Actions environment variables (`GITHUB_SERVER_URL`, `GITHUB_REPOSITORY`, `GITHUB_SHA`); when those are absent they fall back to plain file locations.

## Usage

Add a `@TODO` comment with a link to a GitHub issue or pull request:

```js
/*
  @TODO https://github.com/org/repo/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```
