import { PluginInstance } from "@todone/types";
import { Writable } from "node:stream";

export type PluginFn = () => PluginInstance;

export const instantiatePlugins = function* (
  pluginFns: Record<string, PluginFn>,
  errorStream: Writable
) {
  for (const [name, pluginFn] of Object.entries(pluginFns)) {
    try {
      yield pluginFn();
    } catch (error) {
      errorStream.write(`Error instantianting plugin "${name}":\n`);
      errorStream.write(`${error}\n\n`);
    }
  }
};
