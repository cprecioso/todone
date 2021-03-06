import analyze from "@todone/analyzer";
import type { FileSource, PluginInstance, Reporter } from "@todone/types";
import { pipeline } from "node:stream/promises";
import { runPlugins } from "./runner";

const runTodone = async (
  source: FileSource,
  reporter: Reporter,
  plugins: readonly PluginInstance[]
) => {
  const pluginRunner = runPlugins(plugins);

  await pipeline(
    source(),
    async function* (files) {
      for await (const file of files) {
        yield* analyze(file);
      }
    },
    async function* (matches) {
      for await (const match of matches) {
        const result = await pluginRunner(match);
        if (result) yield result;
      }
    },
    reporter
  );
};

export default runTodone;
