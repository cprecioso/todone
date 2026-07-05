import assert from "node:assert/strict";
import { Octokit } from "octokit";
import { PluginFactory } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { makeResourceFetchers } from "./api";
import { makeCreateIssuesReporter } from "./reporter/create-issues";
import { reportActionReporter } from "./reporter/report-action";

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

export const GitHubPluginConfig = z
  .object({
    dryRun: z.boolean().default(false).meta({
      description:
        "When true, the create-issues reporter logs issue mutations instead of sending them to GitHub.",
    }),
  })
  .prefault({});

const plugin: PluginFactory = {
  id: pkg.name,
  jsonSchema: z.toJSONSchema(GitHubPluginConfig),
  make: async (rawOptions) => {
    const options = GitHubPluginConfig.parse(rawOptions);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    assert(GITHUB_TOKEN, "GITHUB_TOKEN environment variable is required.");

    const resourceFetchers = makeResourceFetchers(GITHUB_TOKEN);
    const client = new Octokit({ auth: GITHUB_TOKEN });

    return {
      checkers: [
        {
          id: `${pkg.name}/issues`,
          make: async () => ({
            checkMatch: async ({ url }) => {
              const patternResult = pattern.exec(url);
              if (!patternResult) return null;

              const {
                pathname: {
                  groups: { owner, repo, resource_kind, number },
                },
              } = PatternResult.parse(patternResult);

              return resourceFetchers[resource_kind]({ owner, repo }, number);
            },
          }),
        },
      ],
      reporters: [
        reportActionReporter,
        makeCreateIssuesReporter({ client, dryRun: options.dryRun }),
      ],
    };
  },
};

export default plugin;
