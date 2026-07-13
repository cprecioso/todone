import * as pkg from "#/package.json" with { type: "json" };
import { Octokit } from "octokit";
import type { Plugin } from "todone/plugin";
import * as z from "zod";
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

export const makeCheckerPlugin = (client: Octokit): Plugin => {
  const resourceFetchers = makeResourceFetchers(client);

  return {
    name: `${pkg.name}:checker`,

    checkMatch: async ({ url }) => {
      const patternResult = pattern.exec(url);
      if (!patternResult) return null;

      const {
        pathname: {
          groups: { owner, repo, resource_kind, number },
        },
      } = PatternResult.parse(patternResult);

      return await resourceFetchers[resource_kind]({ owner, repo }, number);
    },
  };
};
