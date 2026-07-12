import { CheckerResult } from "todone/plugin";
import * as z from "zod";

const maybeDate = (date: Date | null | undefined): Date | undefined =>
  date ?? undefined;

const Issue = z.object({
  title: z.string(),
  state: z.enum(["opened", "closed"]),
  closed_at: z.coerce.date().nullish(),
});

const MergeRequest = z.object({
  title: z.string(),
  state: z.enum(["opened", "closed", "locked", "merged"]),
  merged_at: z.coerce.date().nullish(),
  closed_at: z.coerce.date().nullish(),
});

const Milestones = z.array(
  z.object({
    title: z.string(),
    state: z.enum(["active", "closed"]),
    due_date: z.coerce.date().nullish(),
  }),
);

export const makeResourceFetchers = (
  instanceUrl: string,
  gitlabToken?: string,
) => {
  const baseUrl = instanceUrl.endsWith("/") ? instanceUrl : `${instanceUrl}/`;

  const apiRequest = async (pathAndQuery: string): Promise<unknown> => {
    const response = await fetch(new URL(`api/v4/${pathAndQuery}`, baseUrl), {
      headers: gitlabToken ? { "PRIVATE-TOKEN": gitlabToken } : {},
    });

    if (!response.ok) {
      throw new Error(
        `GitLab API request failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  };

  return {
    issues: async (project, iid) => {
      const data = Issue.parse(
        await apiRequest(
          `projects/${encodeURIComponent(project)}/issues/${iid}`,
        ),
      );

      return {
        title: data.title,
        isExpired: data.state === "closed",
        expirationDate: maybeDate(data.closed_at),
      };
    },

    merge_requests: async (project, iid) => {
      const data = MergeRequest.parse(
        await apiRequest(
          `projects/${encodeURIComponent(project)}/merge_requests/${iid}`,
        ),
      );

      return {
        title: data.title,
        isExpired: data.state === "merged" || data.state === "closed",
        expirationDate: maybeDate(data.merged_at) ?? maybeDate(data.closed_at),
      };
    },

    milestones: async (project, iid) => {
      // The milestone API is keyed by internal id, but URLs use the iid, so we
      // look it up through the list endpoint's iids filter.
      const data = Milestones.parse(
        await apiRequest(
          `projects/${encodeURIComponent(project)}/milestones?iids[]=${iid}`,
        ),
      );

      const milestone = data[0];
      if (!milestone) {
        throw new Error(`Milestone ${iid} not found in project ${project}`);
      }

      return {
        title: milestone.title,
        isExpired: milestone.state === "closed",
        expirationDate: maybeDate(milestone.due_date),
      };
    },
  } as const satisfies Record<
    string,
    (project: string, iid: number) => Promise<CheckerResult>
  >;
};
