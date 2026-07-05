import * as it from "@cprecioso/async-iterable-helpers";
import { HydratedConfig } from "./lib/config/hydrate";
import { makeAggregateChecker } from "./lib/core/checker";
import { makeFileMatcher } from "./lib/core/matcher";
import { getFiles } from "./lib/files";

export const run = async ({
  reporter: reporterFactory,
  keyword,
  plugins,
  ...config
}: HydratedConfig) => {
  await using reporter = await reporterFactory.make();

  const matcher = makeFileMatcher(keyword);

  const checkerFactories = plugins.flatMap((p) => p.checkers ?? []);
  const checker = await makeAggregateChecker(checkerFactories);

  const results = await it
    .from(
      getFiles(config.globs, {
        cwd: process.cwd(),
        gitignore: config.gitignore,
      }),
    )
    .pipe(it.tap(reporter.reportFile))

    .pipe(it.flatMap(matcher))
    .pipe(it.tap(reporter.reportMatch))

    .pipe(it.map(checker))
    .pipe(it.tap(reporter.reportResult))

    .sink(it.toArray());

  return results;
};
