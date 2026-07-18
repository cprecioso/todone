import type * as t from "#/types";
import * as it from "@cprecioso/async-iterable-helpers";
import * as fs from "node:fs";
import * as readline from "node:readline";

/**
 * Finds and returns matches from a file.
 */
export const makeFileMatcher = (keywordPattern: string) => {
  const re = new RegExp(`${keywordPattern}\\s+?(\\S+)`, "dgu");

  return (file: t.File): AsyncIterable<t.Match> =>
    it
      .from(
        readline.createInterface({
          input: fs.createReadStream(file.fullPath),
          crlfDelay: Infinity,
        }),
      )
      .pipe(it.enumerated())
      .pipe(
        it.flatMap(([i, line]) =>
          line.matchAll(re).map((match) => {
            const url = new URL(match[1]);
            const [startIndex] = match.indices![0]!;

            return {
              file,
              url,
              position: {
                line: i + 1,
                column: startIndex + 1,
              },
            };
          }),
        ),
      );
};
