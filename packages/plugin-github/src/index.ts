import type { Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { makeResourceFetchers } from "./api";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?github.com",
  pathname: "/:owner/:repo/:resource_kind(issues|pull|milestone)/:number",
});

const PatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      owner: z.string(),
      repo: z.string(),
      resource_kind: z.enum(["issues", "pull", "milestone"]),
      number: z.coerce.number().int().positive(),
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

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      const patternResult = pattern.exec(url);
      if (!patternResult) return null;

      const {
        pathname: {
          groups: { owner, repo, resource_kind, number },
        },
      } = PatternResult.parse(patternResult);

      try {
        return await resourceFetchers[resource_kind]({ owner, repo }, number);
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
