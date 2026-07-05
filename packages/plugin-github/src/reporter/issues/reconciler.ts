import { CheckerResult } from "todone/plugin";
import { Match } from "todone/types";
import { GroupedResult, isExpiredResult } from "../util/result";
import { GitHubAPI, RemoteIssue } from "./actions";
import { getIssueData } from "./issue-data";

/**
 * The disposition of a single TODO/issue after comparing the analysis results
 * against the open `todone`-labeled issues.
 */
export type SyncOutcome =
  | {
      type: "LocalOnly";
      url: string;
      result: CheckerResult;
      matches: readonly Match[];
    }
  | {
      type: "RemoteMatched";
      url: string;
      result: CheckerResult;
      matches: readonly Match[];
      issueNumber: number;
    }
  | {
      type: "Orphaned";
      url: string;
      issueNumber: number;
    }
  | {
      type: "Invalid";
      issueNumber: number;
    }
  | {
      type: "NotTriggered";
      url: string;
      result: CheckerResult | null;
      matches: readonly Match[];
    };

export const reconcile = async (
  api: GitHubAPI,
  results: readonly GroupedResult[],
): Promise<SyncOutcome[]> => {
  const issues = await api.fetchCurrentIssues();

  // Parse each issue body into its embedded todoUrl. Any failure
  // (malformed/missing zone, invalid JSON) marks the issue as invalid.
  const validIssues: { issue: RemoteIssue; todoUrl: string }[] = [];
  const invalidIssues: RemoteIssue[] = [];

  for (const issue of issues) {
    const data = parseIssueBody(issue.body);
    if (data) {
      validIssues.push({ issue, todoUrl: data.todoUrl });
    } else {
      invalidIssues.push(issue);
    }
  }

  const issueByUrl = new Map(validIssues.map((v) => [v.todoUrl, v.issue]));

  const outcomes: SyncOutcome[] = [];
  const expiredUrls = new Set<string>();

  for (const result of results) {
    const url = result.url.toString();

    if (isExpiredResult(result)) {
      expiredUrls.add(url);
      const issue = issueByUrl.get(url);

      outcomes.push(
        issue
          ? {
              type: "RemoteMatched",
              url,
              result: result.result,
              matches: result.matches,
              issueNumber: issue.number,
            }
          : {
              type: "LocalOnly",
              url,
              result: result.result,
              matches: result.matches,
            },
      );
    } else {
      outcomes.push({
        type: "NotTriggered",
        url,
        result: result.result,
        matches: result.matches,
      });
    }
  }

  // Valid issues no longer backed by an expired TODO are orphaned.
  for (const { issue, todoUrl } of validIssues) {
    if (!expiredUrls.has(todoUrl)) {
      outcomes.push({
        type: "Orphaned",
        url: todoUrl,
        issueNumber: issue.number,
      });
    }
  }

  for (const issue of invalidIssues) {
    outcomes.push({
      type: "Invalid",
      issueNumber: issue.number,
    });
  }

  return outcomes;
};

const parseIssueBody = (body: string | null | undefined) => {
  if (!body) return null;
  try {
    return getIssueData(body);
  } catch {
    return null;
  }
};
