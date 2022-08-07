import fetch from "@todone/internal-fetch";
import { getApiBaseUrl, TokenMap } from "@todone/internal-github-common";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/types";

const issuePattern = new URLPattern({
  protocol: "http{s}?",
  pathname: "/:owner/:repo/:issueKind(issues|pull)/:issueID",
});

export default definePlugin("GitHubIssuePlugin", async () => {
  const tokens = new TokenMap(process.env.GITHUB_TOKEN);

  return {
    async checkExpiration({ url }) {
      const result = issuePattern.exec(url);
      if (!result) return null;

      const { owner, repo, issueID } = result.pathname.groups;

      const apiBaseUrl = getApiBaseUrl(url);
      if (!tokens.has(apiBaseUrl.hostname)) {
        return null;
      }

      const response = await fetch(
        tokens.makeRequest(
          new URL(`repos/${owner}/${repo}/issues/${issueID}`, apiBaseUrl),
          { headers: { Accept: "application/vnd.github.v3+json" } }
        )
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
