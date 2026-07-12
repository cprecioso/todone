# @todone/plugin-github

A {@link todone} plugin that will alert you when a GitHub issue, pull request, or milestone has been resolved, or when a release or tag has been published.

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

## Usage

Add a `@TODO` comment with a link to a GitHub issue, pull request, or milestone:

```js
/*
  @TODO https://github.com/org/repo/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```

The TODO expires when the issue, pull request, or milestone is closed.

You can also link to a release or tag that doesn't exist yet:

```js
/*
  @TODO https://github.com/org/repo/releases/tag/v2.0.0
  Drop this polyfill once v2.0.0 ships.
*/
```

The TODO expires as soon as the release is published (or the tag is pushed, for tags without a release).
