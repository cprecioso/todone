import * as it from "@cprecioso/async-iterable-helpers";
import { Config } from "./lib/config/schema";
import { PluginContainer } from "./lib/core/container";
import { makeFileMatcher } from "./lib/core/matcher";
import { getFiles } from "./lib/files";
import type { Plugin } from "./plugin";
import type * as t from "./types";

export interface RunOptions {
  /**
   * If set, all reporting goes to this plugin instead of the configured ones.
   * The configured plugins are still used to check URLs and are still
   * disposed of at the end of the run.
   */
  forcedReporter?: Plugin;
}

export const run = async (
  { globs, gitignore, keyword, plugins }: Config,
  { forcedReporter }: RunOptions = {},
) => {
  await using container = new PluginContainer(plugins);
  await using forcedReporterContainer = forcedReporter
    ? new PluginContainer([forcedReporter])
    : null;

  const reporter = forcedReporterContainer ?? container;

  const check = async (match: t.Match): Promise<t.Result> => ({
    url: match.url,
    match,
    result: await container.checkMatch({ url: match.url }),
  });

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
