import type { PluginContext, Reporter } from "#/plugin";
import type * as t from "#/types";
import * as it from "@cprecioso/async-iterable-helpers";
import { Config } from "./lib/config";
import { PluginContainer } from "./lib/container";
import { getFiles } from "./lib/files";
import { cliLogger } from "./lib/logger";
import { makeFileMatcher } from "./lib/matcher";

export interface RunOptions {
  /**
   * If set, all reporting goes to this plugin instead of the configured ones.
   * The configured plugins are still used to check URLs and are still
   * disposed of at the end of the run.
   */
  forcedReporter?: (this: PluginContext) => Promise<Reporter>;
}

export const run = async (
  { globs, gitignore, keyword, plugins }: Config,
  { forcedReporter }: RunOptions = {},
) => {
  const container = new PluginContainer([cliLogger(), ...plugins]);
  const reporter = await (forcedReporter?.call(container) ??
    container.makeReporter());

  try {
    const results = await it
      .from(getFiles(globs, { cwd: process.cwd(), gitignore: gitignore }))
      .pipe(it.tap(reporter.file?.bind(container) ?? noop))

      .pipe(it.flatMap(makeFileMatcher(keyword)))
      .pipe(it.tap(reporter.match?.bind(container) ?? noop))

      .pipe(checkMatchesDeduping(container))
      .pipe(it.tap(reporter.result?.bind(container) ?? noop))

      .sink(it.toArray());

    await reporter.end?.call(container);

    return results;
  } catch (error) {
    await reporter.end?.call(container, error);
    throw error;
  }
};

const noop = async () => {};

function checkMatchesDeduping(
  container: PluginContainer,
): it.PipeFn<t.Match, t.Result> {
  return async function* (matches) {
    const resultsByUrl = new Map<string, t.Result>();

    for await (const match of matches) {
      const url = match.url.toString();
      const result = resultsByUrl.get(url);

      if (result) {
        result.matches.push(match);
      } else {
        const pluginResult = await container.checkMatch({ url: match.url });
        resultsByUrl.set(url, {
          url: match.url,
          matches: [match],
          result: pluginResult,
        });
      }
    }

    yield* resultsByUrl.values();
  };
}
