import { Octokit } from "octokit";
import { CheckerResult } from "todone/plugin";

const maybeDate = (date: string | null): Date | undefined =>
  (date && new Date(date)) || undefined;

export const makeResourceFetchers = (githubToken?: string) => {
  const client = new Octokit(githubToken ? { auth: githubToken } : {});

  return {
    issues: async (repo, issue_number) => {
      const { data } = await client.rest.issues.get({ ...repo, issue_number });

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    },

    pull: async (repo, pull_number) => {
      const { data } = await client.rest.pulls.get({ ...repo, pull_number });

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    },

    milestone: async (repo, milestone_number) => {
      const { data } = await client.rest.issues.getMilestone({
        ...repo,
        milestone_number,
      });

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at) || maybeDate(data.due_on),
      };
    },
  } as const satisfies Record<
    string,
    (
      repo: { owner: string; repo: string },
      number: number,
    ) => Promise<CheckerResult>
  >;
};
