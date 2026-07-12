import { CheckerResult } from "todone/plugin";
import * as z from "zod";

const maybeDate = (date: string | null | undefined): Date | undefined =>
  (date && new Date(date)) || undefined;

const Issue = z.object({
  title: z.string(),
  state: z.string(),
  closed_at: z.string().nullish(),
});

const Milestone = z.object({
  title: z.string(),
  state: z.string(),
  closed_at: z.string().nullish(),
  due_on: z.string().nullish(),
});

export const makeResourceFetchers = (token?: string) => {
  const apiRequest = async (instance: URL, path: string): Promise<unknown> => {
    const response = await fetch(new URL(`api/v1/${path}`, instance), {
      headers: {
        accept: "application/json",
        ...(token ? { authorization: `token ${token}` } : null),
      },
    });

    if (!response.ok) {
      throw new Error(
        `Forgejo API request failed (${response.status} ${response.statusText}): ${response.url}`,
      );
    }

    return await response.json();
  };

  return {
    issues: async (instance, { owner, repo }, number) => {
      const data = Issue.parse(
        await apiRequest(instance, `repos/${owner}/${repo}/issues/${number}`),
      );

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    },

    pulls: async (instance, { owner, repo }, number) => {
      const data = Issue.parse(
        await apiRequest(instance, `repos/${owner}/${repo}/pulls/${number}`),
      );

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    },

    milestone: async (instance, { owner, repo }, number) => {
      const data = Milestone.parse(
        await apiRequest(
          instance,
          `repos/${owner}/${repo}/milestones/${number}`,
        ),
      );

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at) || maybeDate(data.due_on),
      };
    },
  } as const satisfies Record<
    string,
    (
      instance: URL,
      repo: { owner: string; repo: string },
      number: number,
    ) => Promise<CheckerResult>
  >;
};
