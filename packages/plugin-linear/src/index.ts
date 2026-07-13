import type { Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { createLinearApi } from "./api";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "linear.app",
  pathname: "/:workspace/issue/:issueID([A-Za-z0-9]+-[0-9]+)/:slug?",
});

const PatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      issueID: z.string(),
    }),
  }),
});

export interface LinearPluginOptions {
  /** Linear API key. Defaults to `process.env.LINEAR_API_KEY`. */
  apiKey?: string;
}

const linearPlugin = ({
  apiKey = process.env.LINEAR_API_KEY,
}: LinearPluginOptions = {}): Plugin => {
  if (!apiKey) {
    process.emitWarning(
      "No Linear API key provided (`apiKey` option or LINEAR_API_KEY env var). " +
        "Any Linear URL check will fail.",
      { code: "TODONE_LINEAR_NO_API_KEY" },
    );
  }

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      const patternResult = pattern.exec(url);
      if (!patternResult) return null;

      if (!apiKey) {
        throw new Error(
          `A Linear API key is required to check ${url}. ` +
            `Set the \`apiKey\` option or the LINEAR_API_KEY environment variable.`,
        );
      }

      const api = createLinearApi(apiKey);

      const {
        pathname: {
          groups: { issueID },
        },
      } = PatternResult.parse(patternResult);

      const issue = await api.getIssue(issueID);

      const isExpired =
        issue.state.type === "completed" || issue.state.type === "canceled";

      return {
        title: issue.title,
        isExpired,
        expirationDate: issue.completedAt ?? issue.canceledAt ?? undefined,
      };
    },
  };
};

export default linearPlugin;
