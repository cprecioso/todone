import type { Match, PluginInstance } from "@todone/types";

export const tryPlugins = async (
  match: Match,
  plugins: readonly PluginInstance[]
) => {
  for (const plugin of plugins) {
    const result = await plugin.checkExpiration(match);
    if (result) return result;
  }
  return null;
};
