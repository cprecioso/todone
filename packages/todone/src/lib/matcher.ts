import type * as t from "#/types";
import { TextLineStream } from "@std/streams";
import * as fs from "node:fs";
import { Readable } from "node:stream";

/**
 * Finds and returns matches from a file.
 */
export const makeFileMatcher = (keywordPattern: string) => {
  const re = new RegExp(`${keywordPattern}\\s+?(\\S+)`, "dgu");

  return async function* (file: t.File): AsyncIterable<t.Match> {
    const lines$ = (
      Readable.toWeb(fs.createReadStream(file.fullPath)) as ReadableStream<
        Uint8Array<ArrayBuffer>
      >
    )
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());

    let i = 0;
    for await (const line of lines$) {
      for (const match of line.matchAll(re)) {
        const url = new URL(match[1]);
        const [startIndex] = match.indices![0]!;

        yield {
          file,
          url,
          position: {
            line: i + 1,
            column: startIndex + 1,
          },
        };
      }

      i++;
    }
  };
};
