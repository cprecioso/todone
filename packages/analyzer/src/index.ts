import type { FileAnalyzer } from "@todone/types";
import { pipeline as innerPipeline } from "node:stream";
import split from "split2";
import { re } from "./util/regex";
import { tryURL } from "./util/url";
import { assertStreamFile } from "./util/vinyl";

const KEYWORD = "@TODO";
const MATCHER = re`${KEYWORD}\s+?(\S+)`("dgu");

const analyze: FileAnalyzer = async function* (file) {
  if (!(file.isBuffer() || file.isStream())) return;
  assertStreamFile(file, "Vinyl files should be streams");

  const lines: AsyncIterable<string> = innerPipeline(
    file.contents,
    split(),
    () => {}
  );

  let line = 1;
  for await (const lineText of lines) {
    for (const match of lineText.matchAll(MATCHER)) {
      const url = tryURL(match[1]);
      if (url) {
        const indices = (match as any).indices[0] as [number, number];
        yield {
          file: file.relative,
          url,
          start: { line, column: indices[0] + 1 },
          end: { line, column: indices[1] + 1 },
        };
      }
    }

    line++;
  }
};

export default analyze;
