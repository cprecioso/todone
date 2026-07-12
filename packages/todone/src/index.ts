import * as it from "@cprecioso/async-iterable-helpers";
import { Config } from "./lib/config/schema";
import { PluginContainer, UnhandledUrlError } from "./lib/core/container";
import { makeFileMatcher } from "./lib/core/matcher";
import { getFiles } from "./lib/files";
import type * as t from "./types";

export const run = async ({
  globs,
  gitignore,
  keyword,
  plugins,
  unhandledUrls,
}: Config) => {
  await using container = new PluginContainer(plugins);

  const check = async (match: t.Match): Promise<t.Result> => {
    const result = await container.checkMatch({ url: match.url });

    if (result === null) {
      switch (unhandledUrls) {
        case "error":
          throw new UnhandledUrlError(match);
        case "warn":
          await container.warn(
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
    .pipe(it.tap(container.reportFile))

    .pipe(it.flatMap(makeFileMatcher(keyword)))
    .pipe(it.tap(container.reportMatch))

    .pipe(it.map(check))
    .pipe(it.tap(container.reportResult))

    .sink(it.toArray());

  return results;
};
