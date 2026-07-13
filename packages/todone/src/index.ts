import * as it from "@cprecioso/async-iterable-helpers";
import { Config } from "./lib/config/schema";
import { PluginContainer } from "./lib/core/container";
import { makeFileMatcher } from "./lib/core/matcher";
import { getFiles } from "./lib/files";
import type { Plugin } from "./plugin";
import type * as t from "./types";

class UnhandledUrlError extends Error {
  constructor(match: t.Match) {
    const {
      url,
      file,
      position: { line, column },
    } = match;
    super(
      `No plugin returned a result for ${url} (${file.localPath}:${line}:${column}). ` +
        `Add a plugin that handles this URL, or set \`unhandledUrls: "warn"\` or \`"ignore"\` in your todone config.`,
    );
  }
}

export interface RunOptions {
  /**
   * If set, all reporting goes to this plugin instead of the configured ones.
   * The configured plugins are still used to check URLs and are still
   * disposed of at the end of the run.
   */
  forcedReporter?: Plugin;
}

export const run = async (
  { globs, gitignore, keyword, plugins, unhandledUrls }: Config,
  { forcedReporter }: RunOptions = {},
) => {
  await using container = new PluginContainer(plugins);
  await using forcedReporterContainer = forcedReporter
    ? new PluginContainer([forcedReporter])
    : null;

  const reporter = forcedReporterContainer ?? container;

  const check = async (match: t.Match): Promise<t.Result> => {
    const result = await container.checkMatch({ url: match.url });

    if (result === null) {
      switch (unhandledUrls) {
        case "error":
          throw new UnhandledUrlError(match);
        case "warn":
          await reporter.warn(
            `no plugin handled ${match.url} (${match.file.localPath}:${match.position.line}:${match.position.column})`,
          );
        // fallthrough
        case "ignore":
          break;
        default:
          return unhandledUrls satisfies never;
      }
    }

    return { url: match.url, match, result };
  };

  const results = await it
    .from(getFiles(globs, { cwd: process.cwd(), gitignore: gitignore }))
    .pipe(it.tap(reporter.reportFile))

    .pipe(it.flatMap(makeFileMatcher(keyword)))
    .pipe(it.tap(reporter.reportMatch))

    .pipe(it.map(check))
    .pipe(it.tap(reporter.reportResult))

    .sink(it.toArray());

  return results;
};
