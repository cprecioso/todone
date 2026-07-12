import * as it from "@cprecioso/async-iterable-helpers";
import { Config } from "./lib/config/schema";
import { makeAggregateChecker } from "./lib/core/checker";
import { makeFileMatcher } from "./lib/core/matcher";
import { getFiles } from "./lib/files";

export const run = async ({
  globs,
  gitignore,
  reporters: reporterFn,
  keyword,
  plugins,
  unhandledUrls,
}: Config) => {
  await using reporter = await reporterFn();

  const results = await it
    .from(getFiles(globs, { cwd: process.cwd(), gitignore: gitignore }))
    .pipe(it.tap(reporter.reportFile))

    .pipe(it.flatMap(makeFileMatcher(keyword)))
    .pipe(it.tap(reporter.reportMatch))

    .pipe(it.map(makeAggregateChecker(plugins, { unhandledUrls, reporter })))
    .pipe(it.tap(reporter.reportResult))

    .sink(it.toArray());

  return results;
};
