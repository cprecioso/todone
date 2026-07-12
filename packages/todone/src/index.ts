import * as it from "@cprecioso/async-iterable-helpers";
import { ResolvedConfig } from "./lib/config/resolve";
import { makeAggregateChecker, UNHANDLED } from "./lib/core/checker";
import { makeFileMatcher } from "./lib/core/matcher";
import { getFiles } from "./lib/files";
import * as t from "./types";

export class UnhandledUrlError extends Error {
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
    this.name = "UnhandledUrlError";
  }
}

export const run = async ({
  reporter,
  keyword,
  plugins,
  unhandledUrls,
  ...config
}: ResolvedConfig) => {
  await using _reporter = reporter;

  const matcher = makeFileMatcher(keyword);
  const checker = makeAggregateChecker(plugins);

  const handleMatch = async (match: t.Match): Promise<t.Result> => {
    const outcome = await checker(match);
    if (outcome !== UNHANDLED) return outcome;

    switch (unhandledUrls) {
      case "error":
        throw new UnhandledUrlError(match);
      case "warn":
        await reporter.info(
          `warning: no plugin handled ${match.url} (${match.file.localPath}:${match.position.line}:${match.position.column})`,
        );
      // fallthrough
      case "ignore":
        return { url: match.url, match, result: null };
    }
  };

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

    .pipe(it.map(handleMatch))
    .pipe(it.tap(reporter.reportResult))

    .sink(it.toArray());

  return results;
};
