import fetch from "@todone/internal-fetch";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/types";
import { parseTokens } from "./parseTokens";

const issuePattern = new URLPattern({
  protocol: "http{s}?",
  pathname: "/:owner/:repo/:issueKind(issues|pull)/:issueID",
});

export default definePlugin("GitHubIssuePlugin", async () => {
  const tokens = parseTokens(process.env.GITHUB_TOKEN);

  return {
    async checkExpiration({ url }) {
      const result = issuePattern.exec(url);
      if (!result) return null;

      const { protocol, hostname } = url;
      const { owner, repo, issueID } = result.pathname.groups;

      const apiBaseUrl =
        hostname === "github.com" || hostname === "www.github.com"
          ? new URL("https://api.github.com/")
          : new URL(`${protocol}//${hostname}/api/v3/`);

      if (!tokens.has(apiBaseUrl.hostname)) {
        return null;
      }

      const token = tokens.get(apiBaseUrl.hostname);

      const response = await fetch(
        new URL(`repos/${owner}/${repo}/issues/${issueID}`, apiBaseUrl),
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(token ? { Authorization: `token ${token}` } : {}),
          },
        }
      );
      const data: any = await response.json();

      if (response.status >= 400 && response.status < 500) {
        throw new Error("Error accessing issue or PR: " + data.message);
      }

      if (!data.state)
        throw new Error(
          "Not an issue or pull request: " + (await response.text())
        );

      const isExpired = data.state === "closed";
      const closeDate = data.closed_at && new Date(data.closed_at);

      return {
        isExpired,
        expiration: closeDate
          ? { date: closeDate, isApproximation: false }
          : null,
      };
    },
  };
});
