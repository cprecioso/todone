import URLPattern from "@todone/internal-urlpattern";
import type { PluginInstance } from "@todone/types";
import got from "got";

const issuePattern = new URLPattern({
  protocol: "http{s}?",
  pathname: "/:owner/:repo/:issueKind(issues|pull)/:issueID",
});

const GitHubIssuePlugin = (): PluginInstance => ({
  name: "GitHub Issues",

  async checkExpiration(url) {
    const result = issuePattern.exec(url);
    if (!result) return null;

    const { hostname } = url;
    const { owner, repo, issueID } = result.pathname.groups;

    if (!(hostname === "github.com" || hostname === "www.github.com")) {
      console.error(
        `GitHub Enterprise servers are not supported yet (possibly ${hostname})`
      );
      return null;
    }

    const data: any = await got(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueID}`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    ).json();

    const isExpired = data.state === "closed";
    const closeDate = data.closed_at && new Date(data.closed_at);

    return {
      isExpired,
      expiration: closeDate
        ? { date: closeDate, isApproximation: false }
        : null,
    };
  },
});

export default GitHubIssuePlugin;
