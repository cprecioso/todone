import { getApiBaseUrl, TokenMap } from "@todone/internal-github-common";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin, Match } from "@todone/types";
import assert from "node:assert/strict";

class GitHubIssuePlugin {
  static pattern = new URLPattern({
    protocol: "http{s}?",
    pathname: "/:owner/:repo/:issueKind(issues|pull)/:issueID",
  });

  static async make() {
    const tokens = new TokenMap(process.env.GITHUB_TOKEN);
    return new this(tokens);
  }

  readonly #tokens: TokenMap;
  readonly patterns: URLPattern[];
  constructor(tokens: TokenMap) {
    this.#tokens = tokens;
    this.patterns = tokens
      .getHosts()
      .map((hostname) => new URLPattern({ hostname }));
  }

  async check({ url }: Match) {
    const result = GitHubIssuePlugin.pattern.exec(url);
    assert(result);

    const { owner, repo, issueID } = result.pathname.groups;

    const apiBaseUrl = getApiBaseUrl(url);
    assert(this.#tokens.has(apiBaseUrl.hostname));

    const response = await fetch(
      this.#tokens.makeRequest(
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
  }
}

export default definePlugin(GitHubIssuePlugin);
