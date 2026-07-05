/**
 * The pieces of GitHub Actions context the reporters need to build permalinks
 * and issue links.
 *
 * These come from the standard environment variables GitHub Actions injects
 * (read directly from `process.env`, since plugin options only carry the
 * plugin's JSON config, not the runner environment). When running locally they
 * may be absent, in which case the reporters fall back to plain file locations.
 */
export interface ActionContext {
  /** Base URL of the GitHub server, e.g. `https://github.com`. */
  serverUrl: string;
  /** The `owner`/`repo` pair, if `GITHUB_REPOSITORY` is set. */
  repo?: { owner: string; repo: string };
  /** The commit SHA being analyzed, if `GITHUB_SHA` is set. */
  sha?: string;
}

const fromEnv = (name: string) => process.env[name] || undefined;

export const loadContext = (): ActionContext => {
  const serverUrl = fromEnv("GITHUB_SERVER_URL") ?? "https://github.com";

  let repo: ActionContext["repo"];
  const repository = fromEnv("GITHUB_REPOSITORY");
  if (repository) {
    const [owner, name] = repository.split("/");
    if (owner && name) repo = { owner, repo: name };
  }

  const sha = fromEnv("GITHUB_SHA");

  return { serverUrl, repo, sha };
};
