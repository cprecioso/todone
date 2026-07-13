# @todone/plugin-jira

A {@link todone} plugin that will alert you when a Jira issue has been resolved.

## Setup

Call the plugin factory in your `todone.config.ts`:

```ts
import jiraPlugin from "@todone/plugin-jira";
import { defineConfig } from "todone/config";

export default defineConfig({
  plugins: [jiraPlugin()],
});
```

## Options

- `token`: The Jira token to use for authentication. For Jira Cloud, create an API token from your Atlassian account settings; for Jira Server/Data Center, create a personal access token. Defaults to the `JIRA_API_TOKEN` environment variable.

  Without a token, the plugin still works for publicly accessible issues and emits a warning when created. Checking a URL that requires authentication without a token fails with an error explaining that a token may be required.

- `email`: The email of the Jira account the token belongs to. Required for Jira Cloud API tokens (which use Basic authentication); leave empty for Jira Server/Data Center personal access tokens (which use Bearer authentication). Defaults to the `JIRA_EMAIL` environment variable.

- `instanceUrls`: Additional Jira instance URLs to match, for Jira Server/Data Center or other custom domains. URLs on `*.atlassian.net` are always matched. Defaults to the `JIRA_INSTANCE_URL` environment variable (a single URL) if set.

## Usage

Add a `@TODO` comment with a link to a Jira issue:

```js
/*
  @TODO https://yourcompany.atlassian.net/browse/PROJ-123
  Remove this workaround once the migration ticket is done.
*/
legacyProcessQueue();
```

An issue counts as expired once its status is in the "Done" status category (e.g. Done, Closed, Resolved), with the issue's resolution date as the expiration date.
