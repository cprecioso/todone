import type { Match, PluginInstance } from "@todone/types";
import { TodoneOptions } from "./options";

export const instantiatePlugins = async function* ({
  plugins: factories,
  toleratePluginInstantiationErrors,
  warnLogger,
}: TodoneOptions) {
  for await (const factory of factories) {
    try {
      const instance = await factory();
      yield instance;
    } catch (err) {
      if (!toleratePluginInstantiationErrors) throw err;
      warnLogger(`${factory.displayName} will be disabled due to:`);
      warnLogger("" + err);
      warnLogger("");
    }
  }
};

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
