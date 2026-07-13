import { Octokit } from "octokit";
import type { PluginOption } from "todone/plugin";
import { makeCheckerPlugin } from "./checker";
import { makeLoggerPlugin } from "./logger";
import { GithubPluginOptionsInput, GithubPluginOptionsSchema } from "./options";
import { makeReporterHooks } from "./reporter";

/**
 * A todone plugin for GitHub.
 *
 * It always checks whether the GitHub issue, pull request, or milestone a TODO
 * points at has been resolved. On top of that, it can report the run to GitHub
 * Actions ({@link GithubPluginOptions.summary}) and keep a set of issues in
 * sync with the expired TODOs ({@link GithubPluginOptions.createIssues}).
 */
const githubPlugin = (
  inputOptions: GithubPluginOptionsInput = {},
): PluginOption => {
  const options = GithubPluginOptionsSchema.parse(inputOptions);

  if (!options.token) {
    if (options.createIssues) {
      throw new Error(
        "A GitHub token is required to sync issues (`token` option or GITHUB_TOKEN env var).",
      );
    }

    process.emitWarning(
      "No GitHub token provided (`token` option or GITHUB_TOKEN env var). " +
        "Public repositories will still work, but private repositories and " +
        "higher rate limits require a token.",
      { code: "TODONE_GITHUB_NO_TOKEN" },
    );
  }

  const client = new Octokit(options.token ? { auth: options.token } : {});

  return [
    makeCheckerPlugin(client),
    makeLoggerPlugin(options),
    makeReporterHooks(client, options),
  ].filter((v) => !!v);
};

export default githubPlugin;
