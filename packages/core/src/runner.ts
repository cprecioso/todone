import type { File } from "@todone/types";
import { analyze } from "./analyzer";
import { defaultTodoneOptions, TodoneOptions } from "./options";
import { instantiatePlugins, tryPlugins } from "./plugins";
import { collectAsyncIterable } from "./util/async";

export const runTodone = async function* (
  files: AsyncIterable<File>,
  partialOptions: Partial<TodoneOptions> = {}
) {
  const options = { ...defaultTodoneOptions, ...partialOptions };

  const plugins = await collectAsyncIterable(instantiatePlugins(options));

  for await (const file of files) {
    const matches = analyze(file);
    for await (const match of matches) {
      const result = await tryPlugins(match, plugins);
      yield { match, result };
    }
  }
};
