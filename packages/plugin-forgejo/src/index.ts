import type { Plugin } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import { makeResourceFetchers } from "./api";

const DEFAULT_INSTANCES = ["https://codeberg.org"];

const makeInstancePattern = (instance: URL) =>
  new URLPattern({
    protocol: instance.protocol.slice(0, -1),
    hostname: instance.hostname,
    port: instance.port,
    pathname: `${instance.pathname.replace(/\/$/, "")}/:owner/:repo/:resource_kind(issues|pulls|milestone)/:number`,
  });

const PatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      owner: z.string(),
      repo: z.string(),
      resource_kind: z.enum(["issues", "pulls", "milestone"]),
      number: z.coerce.number().int().positive(),
    }),
  }),
});

export interface ForgejoPluginOptions {
  /**
   * Base URLs of the Forgejo instances whose links should be checked.
   * Defaults to `["https://codeberg.org"]`. Instances hosted under a subpath
   * (e.g. `https://example.com/forgejo`) are supported.
   */
  instances?: readonly (string | URL)[];

  /** Forgejo API token. Defaults to `process.env.FORGEJO_TOKEN`. */
  token?: string;
}

const forgejoPlugin = ({
  instances = DEFAULT_INSTANCES,
  token = process.env.FORGEJO_TOKEN,
}: ForgejoPluginOptions = {}): Plugin => {
  if (!token) {
    process.emitWarning(
      "No Forgejo token provided (`token` option or FORGEJO_TOKEN env var). " +
        "Public repositories will still work, but private repositories and " +
        "higher rate limits require a token.",
      { code: "TODONE_FORGEJO_NO_TOKEN" },
    );
  }

  const instanceMatchers = instances.map((instance) => {
    const instanceURL = new URL(instance);
    // A trailing slash makes the URL usable as a base for API paths
    if (!instanceURL.pathname.endsWith("/")) instanceURL.pathname += "/";
    return { instanceURL, pattern: makeInstancePattern(instanceURL) };
  });

  const resourceFetchers = makeResourceFetchers(token);

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      for (const { instanceURL, pattern } of instanceMatchers) {
        const patternResult = pattern.exec(url);
        if (!patternResult) continue;

        const {
          pathname: {
            groups: { owner, repo, resource_kind, number },
          },
        } = PatternResult.parse(patternResult);

        try {
          return await resourceFetchers[resource_kind](
            instanceURL,
            { owner, repo },
            number,
          );
        } catch (error) {
          if (token) throw error;
          throw new Error(
            `Forgejo request for ${url} failed without authentication. ` +
              `This URL may require a FORGEJO_TOKEN (private repository or rate limit).`,
            { cause: error },
          );
        }
      }

      return null;
    },
  };
};

export default forgejoPlugin;
