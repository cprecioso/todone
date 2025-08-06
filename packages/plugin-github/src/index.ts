import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/plugin";
import { Octokit } from "octokit";
import * as z from "zod/v4-mini";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?github.com",
  pathname: "/:owner/:repo/:issue_kind(issues|pull)/:number",
});

const patternResultSchema = z.object({
  pathname: z.object({
    groups: z.object({
      owner: z.string(),
      repo: z.string(),
      issue_kind: z.enum(["issues", "pull"]),
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

        const { owner, repo, issue_kind, number } = result.pathname.groups;

        const { data } =
          issue_kind === "issues"
            ? await client.rest.issues.get({
                owner,
                repo,
                issue_number: number,
              })
            : await client.rest.pulls.get({ owner, repo, pull_number: number });

        const isExpired = data.state === "closed";
        const closeDate = data.closed_at && new Date(data.closed_at);

        return {
          title: data.title,
          isExpired,
          expirationDate: closeDate || undefined,
        };
      },
    };
  },
);
