# @todone/plugin-github

A {@link todone} plugin that will alert you when an GitHub issue or pull request has been resolved.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import githubPlugin from "@todone/plugin-github";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [githubPlugin({ token: process.env.GITHUB_TOKEN })],
});
```

## Options

- `token`: The GitHub API token to use for authentication. You can generate a personal access token from your GitHub account settings. Defaults to the `GITHUB_TOKEN` environment variable.

Without a token, the plugin still works for public repositories (subject to GitHub's unauthenticated rate limits) and emits a warning when created. Checking a URL that requires authentication (e.g. a private repository) without a token fails with an error explaining that a token may be required.

## Usage

Add a `@TODO` comment with a link to a GitHub issue or pull request:

```js
/*
  @TODO https://github.com/org/repo/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```
