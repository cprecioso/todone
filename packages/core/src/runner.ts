import { Match, PluginInstance } from "@todone/types";

export const runPlugins =
  (plugins: readonly PluginInstance[]) => async (match: Match) => {
    for (const plugin of plugins) {
      const result = await plugin.checkExpiration(match.url, { match });
      if (result) return { match, result };
    }

    return null;
  };
