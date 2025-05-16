import type { File, Match } from "@todone/types";
import { pipeline } from "node:stream";
import split from "split2";
import { TodoneOptions } from ".";
import { re } from "./util/regex";
import { tryURL } from "./util/url";

export const analyze = async function* (
  file: File,
  options: TodoneOptions,
): AsyncIterable<Match> {
  const matcher = re`${options.keyword}\s+?(\S+)`("dgu");

  const lines: AsyncIterable<string> = pipeline(
    await file.getContent(),
    split(),
    () => {},
  );

  let line = 1;
  for await (const lineText of lines) {
    for (const match of lineText.matchAll(matcher)) {
      const url = tryURL(match[1]);
      if (url) {
        const indices = (match as any).indices[0] as [number, number];
        yield {
          file,
          url,
          start: { line, column: indices[0] + 1 },
          end: { line, column: indices[1] + 1 },
        };
      }
    }

    line++;
  }
};
