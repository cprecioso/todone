import { assert } from "@std/assert";
import { getApiBaseUrl, TokenMap } from "@todone/internal-github-common";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/plugin";
import * as z from "zod/v4";

const pattern = new URLPattern({
  protocol: "http{s}?",
  pathname: "/:owner/:repo/:issueKind(issues|pull)/:issueID",
});

export default definePlugin(
  {
    token: {
      schema: z.string().optional(),
      envName: "GITHUB_TOKEN",
    },
  },
  async ({ token }) => {
    const tokens = new TokenMap(token);

    return {
      name: "GitHub Issue",

      pattern,

      async check({ url }) {
        const result = pattern.exec(url);
        assert(result);

        const { owner, repo, issueID } = result.pathname.groups;

        const apiBaseUrl = getApiBaseUrl(url);
        assert(tokens.has(apiBaseUrl.hostname));

        const response = await fetch(
          tokens.makeRequest(
            new URL(`repos/${owner}/${repo}/issues/${issueID}`, apiBaseUrl),
            { headers: { Accept: "application/vnd.github.v3+json" } },
          ),
        );
        const data: any = await response.json();

        if (response.status >= 400 && response.status < 500) {
          throw new Error("Error accessing issue or PR: " + data.message);
        }

        if (!data.state)
          throw new Error(
            "Not an issue or pull request: " + (await response.text()),
          );

        const isExpired = data.state === "closed";
        const closeDate = data.closed_at && new Date(data.closed_at);

        return {
          isExpired,
          expirationDate: closeDate || undefined,
        };
      },
    };
  },
);
