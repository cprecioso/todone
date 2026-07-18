import type { Plugin } from "#/plugin";
import type * as t from "#/types";
import * as it from "@cprecioso/async-iterable-helpers";
import { ConfigInput, ConfigSchema } from "./lib/config";
import { PluginContainer } from "./lib/container";
import { getFiles } from "./lib/files";
import { makeFileMatcher } from "./lib/matcher";

export interface RunOptions {
  /**
   * If set, all reporting goes to this plugin instead of the configured ones.
   * The configured plugins are still used to check URLs and are still
   * disposed of at the end of the run.
   */
  forcedReporter?: Plugin;
}

export const run = async (
  rawConfig: ConfigInput,
  { forcedReporter }: RunOptions = {},
) => {
  const config = ConfigSchema.strict().decode(rawConfig);

  const container = new PluginContainer(config.plugins);
  const reporter = forcedReporter ?? container;

  try {
    const results = await it
      .from(getFiles(process.cwd(), config))
      .pipe(it.tap(reporter.reportFile?.bind(container) ?? noop))

      .pipe(it.flatMap(makeFileMatcher(config.keyword)))
      .pipe(it.tap(reporter.reportMatch?.bind(container) ?? noop))

      .pipe(checkMatchesDeduping(container))
      .pipe(it.tap(reporter.reportResult?.bind(container) ?? noop))

      .sink(it.toArray());

    await reporter.reportEnd?.call(container);

    return results;
  } catch (error) {
    await reporter.reportEnd?.call(container, error);
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
