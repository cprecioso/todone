import { Octokit } from "octokit";
import { PluginContext } from "todone/plugin";
import * as t from "todone/types";
import { GitHubContext } from "../context";
import { CreateIssuesOptions } from "../options";
import { RowData } from "../summary/component";
import { makeGitHubAPI } from "./actions";
import { generateIssue } from "./generator";
import { reconcile } from "./reconciler";

/**
 * Reconciles the run's results against the open `todone`-labeled issues,
 * creating, updating, and closing issues as needed.
 *
 * Returns one summary row per affected match, describing what happened to it,
 * so the caller can fold them into the job summary.
 */
export const syncIssues = async ({
  client,
  context,
  options,
  pluginCtx,
  results,
}: {
  client: Octokit;
  context: GitHubContext;
  options: CreateIssuesOptions;
  pluginCtx: PluginContext;
  results: readonly t.Result[];
}): Promise<RowData[]> => {
  const api = makeGitHubAPI({ client, context, options, pluginCtx });
  const outcomes = await reconcile(api, results);

  const rows: RowData[] = [];

  const pushMatchRows = (
    outcome: {
      url: string;
      result: t.Result["result"];
      matches: readonly t.Match[];
    },
    actionMessage: string,
    issueNumber?: number,
  ) => {
    for (const match of outcome.matches) {
      rows.push({
        match,
        url: outcome.url,
        result: outcome.result ?? undefined,
        issueNumber,
        actionMessage,
      });
    }
  };

  for (const outcome of outcomes) {
    switch (outcome.type) {
      case "LocalOnly": {
        const issueNumber = await api.createIssue(
          generateIssue(context, {
            url: new URL(outcome.url),
            result: outcome.result,
            matches: outcome.matches,
          }),
        );
        pushMatchRows(outcome, "Created", issueNumber);
        break;
      }

      case "RemoteMatched": {
        await api.updateIssue(
          outcome.issueNumber,
          generateIssue(context, {
            url: new URL(outcome.url),
            result: outcome.result,
            matches: outcome.matches,
          }),
        );
        pushMatchRows(outcome, "Updated", outcome.issueNumber);
        break;
      }

      case "Orphaned": {
        await api.closeCompleted(outcome.issueNumber);
        rows.push({
          url: outcome.url,
          issueNumber: outcome.issueNumber,
          actionMessage: "Closed (completed)",
        });
        break;
      }

      case "Invalid": {
        await api.closeInvalid(outcome.issueNumber);
        rows.push({
          issueNumber: outcome.issueNumber,
          actionMessage: "Closed (invalid)",
        });
        break;
      }

      case "NotTriggered": {
        pushMatchRows(outcome, "Waiting");
        break;
      }
    }
  }

  return rows;
};
