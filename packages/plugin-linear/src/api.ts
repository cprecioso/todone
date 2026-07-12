import * as z from "zod";

const StateType = z.enum([
  "triage",
  "backlog",
  "unstarted",
  "started",
  "completed",
  "canceled",
]);

const IssueResponse = z.object({
  data: z
    .object({
      issue: z
        .object({
          title: z.string(),
          completedAt: z.coerce.date().nullable(),
          canceledAt: z.coerce.date().nullable(),
          state: z.object({ type: StateType }),
        })
        .nullable(),
    })
    .nullish(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

const API_URL = "https://api.linear.app/graphql";

// The `issue` query accepts both an issue's UUID and its human-readable
// identifier (e.g. `ENG-123`)
const ISSUE_QUERY = /* GraphQL */ `
  query IssueStatus($id: String!) {
    issue(id: $id) {
      title
      completedAt
      canceledAt
      state {
        type
      }
    }
  }
`;

export const createLinearApi = (apiKey: string) => ({
  getIssue: async (issueID: string) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ query: ISSUE_QUERY, variables: { id: issueID } }),
    });

    if (!response.ok) {
      throw new Error(
        `Linear API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = IssueResponse.parse(await response.json());

    if (result.errors?.length) {
      throw new Error(
        `Linear API request failed: ${result.errors
          .map((error) => error.message)
          .join("; ")}`,
      );
    }

    const issue = result.data?.issue;
    if (!issue) throw new Error("Issue not found: " + issueID);

    return issue;
  },
});
