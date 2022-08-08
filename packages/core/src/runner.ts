import {
  File,
  Report,
  Result,
  transformFile,
  transformMatch,
  transformResult,
} from "@todone/types";
import { analyze } from "./analyzer";
import { normalizeOptions, TodoneOptions } from "./options";
import { instantiatePlugins, tryPlugins } from "./plugins";
import { collectAsyncIterable } from "./util/async";

export const runTodoneIterable = async function* (
  files: AsyncIterable<File>,
  partialOptions: Partial<TodoneOptions> = {}
) {
  const options = normalizeOptions(partialOptions);
  const plugins = await collectAsyncIterable(instantiatePlugins(options));

  for await (const file of files) {
    yield { type: "file", item: transformFile(file) } as const;

    const matches = analyze(file);
    for await (const match of matches) {
      yield { type: "match", item: transformMatch(match) } as const;

      const pluginResult = await tryPlugins(match, plugins, options);
      const result: Result = { match, result: pluginResult };

      yield { type: "result", item: transformResult(result) } as const;
    }
  }
};

export type InflightReports = ReturnType<
  typeof runTodoneIterable
> extends AsyncIterable<infer U>
  ? U
  : never;

export const runTodoneAsync = async (
  ...args: Parameters<typeof runTodoneIterable>
): Promise<Report> => {
  const innerReport = { file: [], match: [], result: [] };

  for await (const { type, item } of runTodoneIterable(...args)) {
    innerReport[type].push(
      // @ts-expect-error
      item
    );
  }

  const { file: files, match: matches, result: results } = innerReport;

  return { files, matches, results };
};
