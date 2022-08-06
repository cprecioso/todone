import type { Match, PluginResult, Result } from "@todone/types";
import { Writable } from "node:stream";

export interface JSONResult {
  match: Omit<Match, "file"> & { file?: undefined; path: string };
  result: PluginResult | null;
}

export const logJSONResults = async (
  stdout: Writable,
  results: AsyncIterable<Result>
) => {
  for await (const result of results) {
    const jsonResult: JSONResult = {
      ...result,
      match: {
        ...result.match,
        file: undefined,
        path: result.match.file.relative,
      },
    };
    stdout.write(`${JSON.stringify(jsonResult)}\n`);
  }
};
