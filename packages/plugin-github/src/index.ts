import { definePlugin } from "@todone/plugin";
import { Octokit } from "octokit";
import * as z from "zod/v4-mini";
import { resourceFetchers } from "./fetch";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?github.com",
  pathname: "/:owner/:repo/:resource_kind(issues|pull|milestone)/:number",
});

const patternResultSchema = z.object({
  pathname: z.object({
    groups: z.object({
      owner: z.string(),
      repo: z.string(),
      resource_kind: z.enum(["issues", "pull", "milestone"]),
      number: z.coerce.number(),
    }),
  }),
});

export default definePlugin(
  {
    token: {
      schema: z.optional(z.string()),
      envName: "GITHUB_TOKEN",
    },
  },
  async ({ token }) => {
    const client = new Octokit({ auth: token });

    return {
      name: "GitHub Issue",

      pattern,

      async check({ url }) {
        const result = patternResultSchema.parse(pattern.exec(url));
        const { owner, repo, resource_kind, number } = result.pathname.groups;
        return resourceFetchers[resource_kind](client, { owner, repo }, number);
      },
    };
  },
);
