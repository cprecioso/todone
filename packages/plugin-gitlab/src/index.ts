import type { Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { makeResourceFetchers } from "./api";

const makePattern = (hostname: string) =>
  new URLPattern({
    protocol: "http{s}?",
    hostname,
    pathname:
      "/:project+/-/:resource_kind(issues|merge_requests|milestones)/:number",
  });

const PatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      project: z.string(),
      resource_kind: z.enum(["issues", "merge_requests", "milestones"]),
      number: z.coerce.number().int().positive(),
    }),
  }),
});

export interface GitlabPluginOptions {
  /** GitLab API token. Defaults to `process.env.GITLAB_TOKEN`. */
  token?: string;
  /**
   * Base URL of the GitLab instance, for self-hosted installations.
   * Defaults to `https://gitlab.com`.
   */
  instanceUrl?: string;
}

const gitlabPlugin = ({
  token = process.env.GITLAB_TOKEN,
  instanceUrl = "https://gitlab.com",
}: GitlabPluginOptions = {}): Plugin => {
  if (!token) {
    process.emitWarning(
      "No GitLab token provided (`token` option or GITLAB_TOKEN env var). " +
        "Public projects will still work, but private projects and " +
        "higher rate limits require a token.",
      { code: "TODONE_GITLAB_NO_TOKEN" },
    );
  }

  const instanceHostname = new URL(instanceUrl).hostname;
  const pattern = makePattern(
    instanceHostname === "gitlab.com" ? "{www.}?gitlab.com" : instanceHostname,
  );

  const resourceFetchers = makeResourceFetchers(instanceUrl, token);

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      const patternResult = pattern.exec(url);
      if (!patternResult) return null;

      const {
        pathname: {
          groups: { project, resource_kind, number },
        },
      } = PatternResult.parse(patternResult);

      try {
        return await resourceFetchers[resource_kind](project, number);
      } catch (error) {
        if (token) throw error;
        throw new Error(
          `GitLab request for ${url} failed without authentication. ` +
            `This URL may require a GITLAB_TOKEN (private project or rate limit).`,
          { cause: error },
        );
      }
    },
  };
};

export default gitlabPlugin;
