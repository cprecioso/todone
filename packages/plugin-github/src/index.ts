import type { CheckerResult, Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { makeResourceFetchers } from "./api";

const numberedPattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?github.com",
  pathname: "/:owner/:repo/:resource_kind(issues|pull|milestone)/:number",
});

const NumberedPatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      owner: z.string(),
      repo: z.string(),
      resource_kind: z.enum(["issues", "pull", "milestone"]),
      number: z.coerce.number().int().positive(),
    }),
  }),
});

const releasePattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?github.com",
  pathname: "/:owner/:repo/releases/tag/:tag",
});

const ReleasePatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      owner: z.string(),
      repo: z.string(),
      tag: z.string().min(1).transform(decodeURIComponent),
    }),
  }),
});

export interface GithubPluginOptions {
  /** GitHub API token. Defaults to `process.env.GITHUB_TOKEN`. */
  token?: string;
}

const githubPlugin = ({
  token = process.env.GITHUB_TOKEN,
}: GithubPluginOptions = {}): Plugin => {
  if (!token) {
    process.emitWarning(
      "No GitHub token provided (`token` option or GITHUB_TOKEN env var). " +
        "Public repositories will still work, but private repositories and " +
        "higher rate limits require a token.",
      { code: "TODONE_GITHUB_NO_TOKEN" },
    );
  }

  const resourceFetchers = makeResourceFetchers(token);

  const matchUrl = (url: URL): (() => Promise<CheckerResult>) | null => {
    const numberedResult = numberedPattern.exec(url);
    if (numberedResult) {
      const {
        pathname: {
          groups: { owner, repo, resource_kind, number },
        },
      } = NumberedPatternResult.parse(numberedResult);

      return () => resourceFetchers[resource_kind]({ owner, repo }, number);
    }

    const releaseResult = releasePattern.exec(url);
    if (releaseResult) {
      const {
        pathname: {
          groups: { owner, repo, tag },
        },
      } = ReleasePatternResult.parse(releaseResult);

      return () => resourceFetchers.release({ owner, repo }, tag);
    }

    return null;
  };

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      const fetchResource = matchUrl(url);
      if (!fetchResource) return null;

      try {
        return await fetchResource();
      } catch (error) {
        if (token) throw error;
        throw new Error(
          `GitHub request for ${url} failed without authentication. ` +
            `This URL may require a GITHUB_TOKEN (private repository or rate limit).`,
          { cause: error },
        );
      }
    },
  };
};

export default githubPlugin;
