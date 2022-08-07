import fetch from "@todone/internal-fetch";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/types";

const issuePattern = new URLPattern({
  protocol: "http{s}?",
  pathname: "/:owner/:repo/:issueKind(issues|pull)/:issueID",
});

export default definePlugin("GitHubIssuePlugin", async () => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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

      const reqURL = new URL(
        `repos/${owner}/${repo}/issues/${issueID}`,
        apiBaseUrl
      );

      const response = await fetch(reqURL, {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
        },
      });
      const data: any = await response.json();

      if (response.status >= 400 && response.status < 500) {
        throw new Error("Error accessing issue or PR: " + data.message);
      }

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
