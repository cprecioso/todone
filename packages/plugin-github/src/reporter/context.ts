import * as Effect from "effect/Effect";
import * as Option from "effect/Option";

/**
 * The pieces of GitHub Actions context the reporters need to build permalinks
 * and issue links.
 *
 * These come from the standard environment variables GitHub Actions injects
 * (read directly from `process.env`, since plugin {@link Config} only sees the
 * plugin's JSON config, not the runner environment). When running locally they
 * may be absent, in which case the reporters fall back to plain file locations.
 */
export interface ActionContext {
  /** Base URL of the GitHub server, e.g. `https://github.com`. */
  serverUrl: string;
  /** The `owner`/`repo` pair, if `GITHUB_REPOSITORY` is set. */
  repo: Option.Option<{ owner: string; repo: string }>;
  /** The commit SHA being analyzed, if `GITHUB_SHA` is set. */
  sha: Option.Option<string>;
}

const fromEnv = (name: string) =>
  Option.fromNullable(process.env[name]).pipe(
    Option.filter((value) => value.length > 0),
  );

export const loadContext: Effect.Effect<ActionContext> = Effect.sync(() => {
  const serverUrl = Option.getOrElse(
    fromEnv("GITHUB_SERVER_URL"),
    () => "https://github.com",
  );

  const repo = Option.flatMap(fromEnv("GITHUB_REPOSITORY"), (value) => {
    const [owner, repo] = value.split("/");
    return owner && repo ? Option.some({ owner, repo }) : Option.none();
  });

  const sha = fromEnv("GITHUB_SHA");

  return { serverUrl, repo, sha } satisfies ActionContext;
});
