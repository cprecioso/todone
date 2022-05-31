import { PluginInstance, PluginRunner } from "@todone/types";

export const runPlugins =
  (plugins: readonly PluginInstance[]): PluginRunner =>
  async (match) => {
    for (const plugin of plugins) {
      const result = await plugin.checkExpiration(match.url, { match });
      if (result) return { match, result };
    }

    return null;
  };
