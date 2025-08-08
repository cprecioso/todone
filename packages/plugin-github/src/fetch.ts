import { PluginResult } from "@todone/types";
import { Octokit } from "octokit";

const maybeDate = (date: string | null): Date | undefined =>
  (date && new Date(date)) || undefined;

export const resourceFetchers = {
  issues: async (client, repo, issue_number) => {
    const { data } = await client.rest.issues.get({
      ...repo,
      issue_number,
    });

    return {
      title: data.title,
      isExpired: data.state === "closed",
      expirationDate: maybeDate(data.closed_at),
    };
  },

  pull: async (client, repo, pull_number) => {
    const { data } = await client.rest.pulls.get({
      ...repo,
      pull_number,
    });

    return {
      title: data.title,
      isExpired: data.state === "closed",
      expirationDate: maybeDate(data.closed_at),
    };
  },

  milestone: async (client, repo, milestone_number) => {
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
    client: Octokit,
    repo: { owner: string; repo: string },
    number: number,
  ) => Promise<PluginResult>
>;
