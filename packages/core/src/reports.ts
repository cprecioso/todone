import { mergeReadableStreams } from "@std/streams";
import * as t from "@todone/types";
import * as s from "@todone/util/stream";
import { getAnalysisStreams } from "./runner";

export type InflightReport =
  | { type: "file"; item: t.ReportFile }
  | { type: "match"; item: t.ReportMatch }
  | { type: "result"; item: t.ReportResult };

type TypeToItem<T extends InflightReport["type"]> = Extract<
  InflightReport,
  { type: T }
>["item"];

export const getReportStream = (
  ...args: Parameters<typeof getAnalysisStreams>
) =>
  s.unasync(async () => {
    const { files, matches, results } = await getAnalysisStreams(...args);

    const report = <const T extends InflightReport["type"], U>(
      type: T,
      stream: ReadableStream<U>,
      transform: (item: U) => TypeToItem<T>,
    ) => stream.pipeThrough(s.map((item) => ({ type, item: transform(item) })));

    return mergeReadableStreams<InflightReport>(
      report("file", files, t.transformFile),
      report("match", matches, t.transformMatch),
      report("result", results, t.transformResult),
    );
  });

export const getReportsPromise = async (
  ...args: Parameters<typeof getReportStream>
) => {
  const report: t.Report = {
    files: [],
    matches: [],
    results: [],
  };

  for await (const value of getReportStream(...args)) {
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
