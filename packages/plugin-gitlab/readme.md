# @todone/plugin-gitlab

A {@link todone} plugin that will alert you when a GitLab issue, merge request, or milestone has been resolved.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import gitlabPlugin from "@todone/plugin-gitlab";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [gitlabPlugin()],
});
```

## Options

- `token`: The GitLab API token to use for authentication. You can generate a personal access token from your GitLab user settings (it only needs the `read_api` scope). Defaults to the `GITLAB_TOKEN` environment variable.

  Without a token, the plugin still works for public projects (subject to GitLab's unauthenticated rate limits) and emits a warning when created. Checking a URL that requires authentication (e.g. a private project) without a token fails with an error explaining that a token may be required.

- `instanceUrl`: The base URL of the GitLab instance, for self-hosted installations. Defaults to `https://gitlab.com`.

## Usage

Add a `@TODO` comment with a link to a GitLab issue, merge request, or milestone:

```js
/*
  @TODO https://gitlab.com/org/repo/-/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```
