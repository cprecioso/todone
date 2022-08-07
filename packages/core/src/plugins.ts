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
  plugins: readonly PluginInstance[],
  { warnLogger }: TodoneOptions
) => {
  for (const plugin of plugins) {
    try {
      const result = await plugin.checkExpiration(match);
      if (result) return result;
    } catch (err) {
      warnLogger(
        `${plugin.displayName} errored while processing ${match.url.href}:`
      );
      warnLogger("" + err);
      warnLogger("");
    }
  }

  return null;
};
