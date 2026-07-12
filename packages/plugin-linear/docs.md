# @todone/plugin-linear

A {@link todone} plugin that will alert you when a Linear issue has been completed or canceled.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import linearPlugin from "@todone/plugin-linear";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [linearPlugin()],
});
```

## Options

- `apiKey`: The Linear API key to use for authentication. You can generate a personal API key from your Linear account's security settings. Defaults to the `LINEAR_API_KEY` environment variable.

The Linear API always requires authentication: without an API key the plugin emits a warning when created, and checking any Linear URL fails with an error.

## Usage

Add a `@TODO` comment with a link to a Linear issue:

```js
/*
  @TODO https://linear.app/my-company/issue/ENG-123/fix-flaky-login
  Remove this workaround once the login flow is fixed.
*/
await retry(() => login(), { attempts: 3 });
```

The TODO is considered expired once the issue reaches a `completed` or `canceled` state.
