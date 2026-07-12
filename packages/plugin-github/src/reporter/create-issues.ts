import * as core from "@actions/core";
import { Octokit } from "octokit";
import type { ReporterFn } from "todone/plugin";
import * as t from "todone/types";
import { ActionContext, loadContext } from "./context";
import { makeGitHubAPI } from "./issues/actions";
import { generateIssue } from "./issues/generator";
import { reconcile } from "./issues/reconciler";
import { RowData, writeSummary } from "./summary/component";
import { groupResults } from "./util/result";

export interface CreateIssuesReporterOptions {
  /**
   * GitHub API token used to read and mutate issues. Defaults to
   * `process.env.GITHUB_TOKEN`.
   */
  token?: string;
  /** When true, issue mutations are logged but never sent to GitHub. */
  dryRun?: boolean;
}

/**
 * Reporter that reconciles expired TODOs against the open `todone`-labeled
 * issues and creates/updates/closes them via the GitHub REST API, then writes a
 * job summary describing what happened. Honors the `dryRun` option.
 */
export const createIssuesReporter = ({
  token = process.env.GITHUB_TOKEN,
  dryRun = false,
}: CreateIssuesReporterOptions = {}): ReporterFn => {
  if (!token && !dryRun) {
    throw new Error(
      "A GitHub token is required to sync issues (`token` option or GITHUB_TOKEN env var).",
    );
  }

  const client = new Octokit(token ? { auth: token } : {});

  return async () => {
    const context = loadContext();
    const results: t.Result[] = [];

    const sync = async (repo: { owner: string; repo: string }) => {
      const api = makeGitHubAPI({ client, repo, dryRun, log: core.info });
      const outcomes = await reconcile(api, groupResults(results));

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

      await writeSummary(context, {
        heading: "TODOs found",
        columns: [
          "file",
          "url",
          "expired",
          "expirationDate",
          "issue",
          "action",
        ],
        rows,
      });
    };

    const runSync = async ({ repo }: ActionContext) => {
      if (!repo) {
        core.warning(
          "GITHUB_REPOSITORY is not set; skipping GitHub issue sync.",
        );
        return;
      }

      try {
        await sync(repo);
      } catch (error) {
        core.error(`Failed to sync issues: ${error}`);
      }
    };

    return {
      warn: async (message) => core.warning(message),
      info: async (message) => core.info(message),
      debug: async (message) => core.debug(message),

      reportFile: async () => {},
      reportMatch: async () => {},

      reportResult: async (result) => {
        results.push(result);
      },

      // Runs at the end of the `await using` scope in the run command, after
      // every result has been accumulated.
      async [Symbol.asyncDispose]() {
        await runSync(context);
      },
    };
  };
};
