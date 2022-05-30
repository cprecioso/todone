import analyze from "@todone/analyzer";
import type { FileSource, PluginInstance, Printer } from "@todone/types";
import { pipeline } from "node:stream/promises";
import { runPlugins } from "./runner";

const runTodone = async (
  source: FileSource,
  printer: Printer,
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
    printer
  );
};

export default runTodone;
