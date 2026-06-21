# @todone/plugin-github

A {@link todone} plugin that will alert you when an GitHub issue or pull request has been resolved.

## Options

- `GITHUB_TOKEN`: The GitHub API token to use for authentication. You can generate a personal access token from your GitHub account settings, or use the token injected by GitHub Actions.
- `dryRun` (default `false`): Used by the `github-create-issues` reporter. When `true`, issue mutations are logged but never sent to GitHub.

## Reporters

This plugin also ships two reporters, meant to run inside GitHub Actions. Select one with `todone run -r <id>`:

- `github-report-action`: Prints every analyzed item to the log and writes a job summary (via the GitHub Actions toolkit `@actions/core`). Local only; it makes no GitHub REST API calls.
- `github-create-issues`: Reconciles expired TODOs against the open `todone`-labeled issues and creates, updates, or closes issues accordingly, then writes a job summary describing what happened. Honors the `dryRun` option.

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
