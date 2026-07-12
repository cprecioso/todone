import type { Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { createJiraApi } from "./api";

const issuePathname = "/browse/:key([A-Z][A-Z0-9_]*-[0-9]+)";

const cloudPattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{*.}?atlassian.net",
  pathname: issuePathname,
});

const PatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      key: z.string(),
    }),
  }),
});

export interface JiraPluginOptions {
  /**
   * Email of the Jira account to authenticate as. Required for Jira Cloud API
   * tokens (Basic auth); leave empty for Jira Server/Data Center personal
   * access tokens (Bearer auth). Defaults to `process.env.JIRA_EMAIL`.
   */
  email?: string;

  /**
   * Jira Cloud API token or Jira Server/Data Center personal access token.
   * Defaults to `process.env.JIRA_API_TOKEN`.
   */
  token?: string;

  /**
   * Additional Jira instance URLs to match, for Jira Server/Data Center or
   * other custom domains. `*.atlassian.net` URLs are always matched. Defaults
   * to `process.env.JIRA_INSTANCE_URL` (a single URL) if set.
   */
  instanceUrls?: string[];
}

const jiraPlugin = ({
  email = process.env.JIRA_EMAIL,
  token = process.env.JIRA_API_TOKEN,
  instanceUrls = process.env.JIRA_INSTANCE_URL
    ? [process.env.JIRA_INSTANCE_URL]
    : [],
}: JiraPluginOptions = {}): Plugin => {
  if (!token) {
    process.emitWarning(
      "No Jira token provided (`token` option or JIRA_API_TOKEN env var). " +
        "Publicly accessible issues will still work, but most Jira instances " +
        "require authentication.",
      { code: "TODONE_JIRA_NO_TOKEN" },
    );
  }

  const patterns = [
    cloudPattern,
    ...instanceUrls.map((instanceUrl) => {
      const { protocol, hostname, port } = new URL(instanceUrl);
      return new URLPattern({
        protocol: protocol.slice(0, -1),
        hostname,
        port,
        pathname: issuePathname,
      });
    }),
  ];

  const api = createJiraApi({ email, token });

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      const patternResult = patterns
        .map((pattern) => pattern.exec(url))
        .find(Boolean);
      if (!patternResult) return null;

      const {
        pathname: {
          groups: { key },
        },
      } = PatternResult.parse(patternResult);

      try {
        return await api.getIssue(url.origin, key);
      } catch (error) {
        if (token) throw error;
        throw new Error(
          `Jira request for ${url} failed without authentication. ` +
            `Set the \`token\` option or the JIRA_API_TOKEN environment variable.`,
          { cause: error },
        );
      }
    },
  };
};

export default jiraPlugin;
