import { mergeReadableStreams } from "@std/streams";
import * as s from "@todone/internal-util/stream";
import * as t from "@todone/types";
import { makeAnalyzer } from "./analyzer";
import { generateResultStream } from "./lib/results";
import { Options, normalizeOptions } from "./options";
import { PluginContainer } from "./plugins";

export type AnalysisItem<File extends t.File> =
  | { type: "file"; file: File }
  | { type: "match"; url: URL; match: t.Match<File> }
  | { type: "result"; result: t.Result<File> };

export interface FullAnalysis<File extends t.File> {
  files: t.File[];
  matches: Map<string, t.Match<File>[]>;
  results: t.Result<File>[];
}

/**
 * This is an internal utility function that actually runs the analysis. It is
 * used by both `analyzeStream` and `analyzePromise`.
 *
 * It is not meant to be used directly by users, as the three streams it returns
 * have to be run in parallel to prevent deadlocks, and we want to avoid the
 * complexity associated with that.
 *
 * The other functions in this file handle the three streams in different ways
 * but always in parallel and end up with a single return.
 */
const analyze = <File extends t.File>(
  inputFiles: AsyncIterable<File>,
  options: Partial<Options> = {},
) => {
  const fullOptions = normalizeOptions(options);
  const pluginContainer = new PluginContainer(fullOptions);

  const [file$, returnFile$] = ReadableStream.from(inputFiles).tee();

  const [match$, returnMatch$] = file$
    .pipeThrough(s.flatMap(makeAnalyzer(fullOptions)))
    .tee();

  const returnResult$ = match$.pipeThrough(
    generateResultStream(pluginContainer),
  );

  return {
    file$: returnFile$,
    match$: returnMatch$,
    result$: returnResult$,
  };
};

/**
 * Run an analysis on a stream of files.
 * @returns A stream of analysis items, which can be files, matches, or results.
 */
export const analyzeStream = <File extends t.File>(
  files: AsyncIterable<File>,
  options: Partial<Options> = {},
) => {
  const { file$, match$, result$ } = analyze(files, options);

  return mergeReadableStreams<AnalysisItem<File>>(
    file$.pipeThrough(s.map((file) => ({ type: "file", file }))),
    match$.pipeThrough(
      s.map(({ url, match }) => ({ type: "match", url, match })),
    ),
    result$.pipeThrough(s.map((result) => ({ type: "result", result }))),
  );
};

/**
 * Run an analysis on a stream of files.
 * @returns A promise of a full report containing files, matches, and results.
 */
export const analyzePromise = async <File extends t.File>(
  inputFiles: AsyncIterable<File>,
  options: Partial<Options> = {},
): Promise<FullAnalysis<File>> => {
  const { file$, match$, result$ } = analyze(inputFiles, options);

  const fileArrayPromise = s.toArray(file$);

  const matchMapPromise = s.reduce(
    match$,
    (map, item) => {
      const url = item.url.toString();
      let arr = map.get(url);
      if (!arr) {
        arr = [];
        map.set(url, arr);
      }
      arr.push(item.match);
      return map;
    },
    new Map<string, t.Match<File>[]>(),
  );

  const resultArrayPromise = s.toArray(result$);

  const [files, matches, results] = await Promise.all([
    fileArrayPromise,
    matchMapPromise,
    resultArrayPromise,
  ]);

  return { files, matches, results };
};
