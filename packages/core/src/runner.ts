import { mergeReadableStreams } from "@std/streams";
import * as s from "@todone/internal-util/stream";
import * as t from "@todone/types";
import { makeAnalyzer } from "./analyzer";
import { Options, normalizeOptions } from "./options";
import { PluginContainer } from "./plugins";

export type AnalysisItem =
  | { type: "file"; item: t.File }
  | { type: "match"; item: t.Match }
  | { type: "result"; item: t.Result };

export interface FullAnalysis {
  files: t.File[];
  matches: t.Match[];
  results: t.Result[];
}

/**
 * Run an analysis on a stream of files.
 * @returns A stream of analysis items, which can be files, matches, or results.
 */
export const analyzeStream = (
  files: AsyncIterable<t.File>,
  options: Partial<Options> = {},
) => {
  const fullOptions = normalizeOptions(options);
  const pluginContainer = new PluginContainer(fullOptions);

  const [file$, returnFile$] = ReadableStream.from(files).tee();

  const [match$, returnMatch$] = file$
    .pipeThrough(s.flatMap(makeAnalyzer(fullOptions)))
    .tee();

  const returnResult$ = match$.pipeThrough(
    s.map(
      async (match): Promise<t.Result> => ({
        match,
        result: await pluginContainer.check(match),
      }),
    ),
  );

  return mergeReadableStreams<AnalysisItem>(
    returnFile$.pipeThrough(s.map((file) => ({ type: "file", item: file }))),
    returnMatch$.pipeThrough(
      s.map((match) => ({ type: "match", item: match })),
    ),
    returnResult$.pipeThrough(
      s.map((result) => ({ type: "result", item: result })),
    ),
  );
};

/**
 * Run an analysis on a stream of files.
 * @returns A promise of a full report containing files, matches, and results.
 */
export const analyzePromise = async (
  files: AsyncIterable<t.File>,
  options: Partial<Options> = {},
) => {
  const stream = analyzeStream(files, options);

  const report: FullAnalysis = {
    files: [],
    matches: [],
    results: [],
  };

  for await (const value of stream) {
    switch (value.type) {
      case "file":
        report.files.push(value.item);
        break;
      case "match":
        report.matches.push(value.item);
        break;
      case "result":
        report.results.push(value.item);
        break;
    }
  }

  return report;
};
