# @todone/plugin-forgejo

A {@link todone} plugin that will alert you when a Forgejo issue or pull request has been resolved. Works with any Forgejo instance ([Codeberg](https://codeberg.org) by default), and should also work with Gitea instances, since they share the same API.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import forgejoPlugin from "@todone/plugin-forgejo";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [forgejoPlugin()],
});
```

## Options

- `instances`: The base URLs of the Forgejo instances whose links should be checked. Defaults to `["https://codeberg.org"]`. Add your own instance here if you self-host, including instances hosted under a subpath:

  ```ts
  forgejoPlugin({
    instances: ["https://codeberg.org", "https://git.example.com/forgejo"],
  });
  ```

- `token`: The Forgejo API token to use for authentication. You can generate an access token from your instance's user settings, under Applications. Defaults to the `FORGEJO_TOKEN` environment variable.

  Without a token, the plugin still works for public repositories (subject to the instance's unauthenticated rate limits) and emits a warning when created. Checking a URL that requires authentication (e.g. a private repository) without a token fails with an error explaining that a token may be required.

  Note that the same token is sent to every configured instance, so if you use several instances with private repositories, prefer configuring one plugin per instance, each with its own token.

## Usage

Add a `@TODO` comment with a link to a Forgejo issue, pull request, or milestone:

```js
/*
  @TODO https://codeberg.org/org/repo/issues/42
  Remove workaround once upstream issue is resolved.
*/
setTimeout(() => processQueue(), 0);
```
