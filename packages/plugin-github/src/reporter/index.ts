import * as pkg from "#/package.json" with { type: "json" };
import * as core from "@actions/core";
import { Octokit } from "octokit";
import type { Plugin, PluginContext } from "todone/plugin";
import * as t from "todone/types";
import { GithubPluginOptions } from "../options";
import { syncIssues } from "./issues/sync";
import { Column, RowData, writeSummary } from "./summary/component";

const BASE_COLUMNS = [
  "file",
  "url",
  "expired",
  "expirationDate",
] as const satisfies Column[];

const ISSUE_COLUMNS = [
  ...BASE_COLUMNS,
  "issue",
  "action",
] as const satisfies Column[];

const toRow = ({ match, match: { url }, result }: t.Result): RowData => ({
  match,
  url: url.toString(),
  result: result ?? undefined,
});

/**
 * Builds the reporting hooks for the enabled features, using the GitHub
 * Actions toolkit. Returns no hooks at all when every feature is disabled, so
 * the plugin stays a pure URL checker.
 *
 * Both features share a single run: results are accumulated as they come in,
 * and when the run finishes the issues are synced (if enabled) and a single
 * job summary is written (if enabled), gaining the issue and action columns
 * when issue syncing is on.
 */
export const makeReporterHooks = (
  client: Octokit,
  options: GithubPluginOptions,
): Plugin | false => {
  const {
    createIssues,
    actions: { summary },
    context,
  } = options;
  if (!summary && !createIssues) return false;

  const results: t.Result[] = [];

  /**
   * Syncs the issues, falling back to plain rows if the sync can't run or
   * fails: a broken sync shouldn't cost us the summary too.
   */
  const report = async (
    pluginCtx: PluginContext,
  ): Promise<{
    rows: RowData[];
    columns: readonly Column[];
  }> => {
    if (createIssues) {
      if (!context.repository) {
        throw new Error(
          "No GitHub repository configured (`context.repository` option or GITHUB_REPOSITORY env var). Can't perform GitHub issue sync.",
        );
      } else {
        try {
          const rows = await syncIssues({
            client,
            context,
            options: createIssues,
            pluginCtx,
            results,
          });
          return { rows, columns: ISSUE_COLUMNS };
        } catch (error) {
          core.error(`Failed to sync issues: ${error}`);
        }
      }
    }

    return { rows: results.map(toRow), columns: BASE_COLUMNS };
  };

  return {
    name: `${pkg.name}:reporter`,

    reportResult: async (result) => {
      results.push(result);
    },

    // Runs when the run finishes, after every result has been accumulated.
    async [Symbol.asyncDispose]() {
      const { rows, columns } = await report(this);
      if (!summary) return;

      try {
        await writeSummary(context, {
          heading: "TODOs found",
          columns,
          rows,
        });
      } catch (error) {
        core.warning(`Failed to write summary: ${error}`);
      }
    },
  };
};
