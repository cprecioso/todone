import type { File, PluginFactory } from "@todone/types";
import { analyze } from "./analyzer";
import { tryPlugins } from "./plugins";
import { asyncMap } from "./util/async";

export interface TodoneOptions {
  plugins?: readonly PluginFactory[];
}

export const runTodone = async function* (
  files: AsyncIterable<File>,
  { plugins: pluginFactories = [] }: TodoneOptions = {}
) {
  const plugins = await asyncMap(
    pluginFactories,
    async (factory) => await factory()
  );

  for await (const file of files) {
    const matches = analyze(file);
    for await (const match of matches) {
      const result = await tryPlugins(match, plugins);
      yield { match, result };
    }
  }
};
