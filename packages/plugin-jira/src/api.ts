import { CheckerResult } from "todone/plugin";
import * as z from "zod";

const IssueResponse = z.object({
  fields: z.object({
    summary: z.string(),
    status: z.object({
      statusCategory: z.object({
        key: z.string(),
      }),
    }),
    resolutiondate: z.coerce.date().nullish(),
  }),
});

export interface JiraCredentials {
  email?: string;
  token?: string;
}

const makeHeaders = ({ email, token }: JiraCredentials): HeadersInit => {
  if (!token) return {};
  // Jira Cloud API tokens use Basic auth with the account email; Jira
  // Server/Data Center personal access tokens use Bearer auth.
  if (email) {
    const credentials = Buffer.from(`${email}:${token}`).toString("base64");
    return { Authorization: `Basic ${credentials}` };
  }
  return { Authorization: `Bearer ${token}` };
};

export const createJiraApi = (credentials: JiraCredentials) => {
  const headers = makeHeaders(credentials);

  return {
    getIssue: async (origin: string, key: string): Promise<CheckerResult> => {
      // `/rest/api/2` is available on both Jira Cloud and Jira Server/Data
      // Center, unlike `/rest/api/3` which is Cloud-only.
      const response = await fetch(
        `${origin}/rest/api/2/issue/${encodeURIComponent(key)}?fields=summary,status,resolutiondate`,
        { headers },
      );

      if (!response.ok) {
        throw new Error(
          `Jira API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const { fields } = IssueResponse.parse(await response.json());

      return {
        title: fields.summary,
        isExpired: fields.status.statusCategory.key === "done",
        expirationDate: fields.resolutiondate ?? undefined,
      };
    },
  };
};
