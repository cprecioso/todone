import { mergeReadableStreams } from "@std/streams";
import { mapMapValues } from "@todone/internal-util/collection";
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

  const resultsPromise = generateResultStream(pluginContainer, match$);

  return {
    file$: returnFile$,
    match$: returnMatch$,
    resultsPromise,
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
  const { file$, match$, resultsPromise } = analyze(files, options);

  return mergeReadableStreams<AnalysisItem<File>>(
    file$.pipeThrough(s.map((file) => ({ type: "file", file }))),
    match$.pipeThrough(
      s.map(({ url, match }) => ({ type: "match", url, match })),
    ),
    s.create(
      resultsPromise.then((results) =>
        results.map((result) => ({ type: "result", result })),
      ),
    ),
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
  const { file$, match$, resultsPromise } = analyze(inputFiles, options);

  const fileArrayPromise = Array.fromAsync(file$);

  const matchMapPromise = Array.fromAsync(match$).then((matches) =>
    mapMapValues(
      Map.groupBy(matches, (item) => item.url.toString()),
      (matches) => matches.map(({ match }) => match),
    ),
  );

  const resultsArrayPromise = resultsPromise.then((results) =>
    Array.from(results),
  );

  const [files, matches, results] = await Promise.all([
    fileArrayPromise,
    matchMapPromise,
    resultsArrayPromise,
  ]);

  return { files, matches, results };
};
