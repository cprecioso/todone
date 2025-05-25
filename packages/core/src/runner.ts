import { mergeReadableStreams } from "@std/streams";
import * as s from "@todone/internal-util/stream";
import * as t from "@todone/types";
import { analyze } from "./analyzer";
import { TodoneOptions, normalizeOptions } from "./options";
import { PluginContainer } from "./plugins";

export type ReportItem =
  | { type: "file"; item: t.File }
  | { type: "match"; item: t.Match }
  | { type: "result"; item: t.Result };

export type FullReport = {
  [Item in ReportItem as Item["type"]]: Item["item"][];
};

export const getAnalysisStream = (
  files: AsyncIterable<t.File>,
  partialOptions: Partial<TodoneOptions> = {},
) => {
  const options = normalizeOptions(partialOptions);
  const pluginContainer = new PluginContainer(options);

  const [file$, returnFile$] = ReadableStream.from(files).tee();

  const [match$, returnMatch$] = file$
    .pipeThrough(s.flatMap((file) => analyze(file, options)))
    .tee();

  const returnResult$ = match$.pipeThrough(
    s.map(
      async (match) =>
        ({ match, result: await pluginContainer.check(match) }) as t.Result,
    ),
  );

  return mergeReadableStreams<ReportItem>(
    returnFile$.pipeThrough(s.map((file) => ({ type: "file", item: file }))),
    returnMatch$.pipeThrough(
      s.map((match) => ({ type: "match", item: match })),
    ),
    returnResult$.pipeThrough(
      s.map((result) => ({ type: "result", item: result })),
    ),
  );
};

export const getAnalysisPromise = async (
  ...args: Parameters<typeof getAnalysisStream>
) => {
  const report: FullReport = {
    file: [],
    match: [],
    result: [],
  };

  for await (const value of getAnalysisStream(...args)) {
    switch (value.type) {
      case "file":
        report.file.push(value.item);
        break;
      case "match":
        report.match.push(value.item);
        break;
      case "result":
        report.result.push(value.item);
        break;
    }
  }

  return report;
};
