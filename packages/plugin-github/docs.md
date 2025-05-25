# @todone/plugin-github

A {@link todone} plugin that will alert you when an GitHub issue or pull request has been resolved.

## Options

- `token`: The GitHub API token to use for authentication. You can generate a personal access token from your GitHub account settings. If using environment variables, set `GITHUB_TOKEN` to your token value.

## Usage

Add a `@TODO` comment with a link to a GitHub issue or pull request:

```js
/*
  @TODO https://github.com/org/repo/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```
