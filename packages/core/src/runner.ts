import * as types from "@todone/types";
import { PassThrough, pipeline } from "node:stream";
import { analyze } from "./analyzer";
import { TodoneOptions, normalizeOptions } from "./options";
import { makePluginContainer } from "./plugins";

export type InflightReport =
  | { type: "file"; item: types.ReportFile }
  | { type: "match"; item: types.ReportMatch }
  | { type: "result"; item: types.ReportResult };

export const runIterable = async function* (
  files: AsyncIterable<types.File>,
  partialOptions: Partial<TodoneOptions> = {}
): AsyncIterable<InflightReport> {
  const options = normalizeOptions(partialOptions);
  const pluginContainer = await makePluginContainer(options.plugins, options);

  const stream = new PassThrough({ objectMode: true });
  const report = (report: InflightReport) => stream.write(report);

  pipeline(
    files,
    async function* (files) {
      for await (const file of files) {
        report({ type: "file", item: types.transformFile(file) });
        yield file;
      }
    },
    async function* (files) {
      for await (const file of files) {
        yield* analyze(file, options);
      }
    },
    async function* (matches) {
      for await (const match of matches) {
        report({ type: "match", item: types.transformMatch(match) });
        yield match;
      }
    },
    async function* (matches) {
      for await (const match of matches) {
        const pluginResult = await pluginContainer.check(match);
        const result: types.Result = { match, result: pluginResult };
        yield result;
      }
    },
    async function (results) {
      for await (const result of results) {
        report({ type: "result", item: types.transformResult(result) });
      }
    },
    (err) => {
      if (err) {
        stream.destroy(err);
      } else {
        stream.end();
      }
    }
  );

  yield* stream;
};

export const runAsync = async (
  ...args: Parameters<typeof runIterable>
): Promise<types.Report> => {
  const reports: {
    [T in InflightReport["type"]]: Extract<
      InflightReport,
      { type: T }
    >["item"][];
  } = { file: [], match: [], result: [] };

  for await (const { type, item } of runIterable(...args)) {
    reports[type].push(
      // @ts-expect-error
      item
    );
  }

  const { file: files, match: matches, result: results } = reports;
  return { files, matches, results };
};
