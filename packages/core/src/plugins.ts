import * as t from "@todone/types";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as pkg from "../package.json" with { type: "json" };
import { Options } from "./options";

const canRun = (
  url: string,
  pattern: undefined | t.Searchable | t.Searchable[],
) => {
  if (!pattern) return true;
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  for (const pattern of patterns) {
    if (pattern.test(url)) return true;
  }
  return false;
};

export class UnsupportedPluginError extends Data.Error<{
  pluginName: string;
  url: string;
}> {}

const checkPlugin = (plugin: typeof t.Plugin.Service, url: URL) =>
  Effect.gen(function* () {
    const urlString = url.toString();
    if (!canRun(urlString, plugin.pattern)) {
      return yield* new UnsupportedPluginError({
        pluginName: plugin.name,
        url: urlString,
      });
    }

    return yield* pipe(
      plugin.check({ url }),
      Effect.mapError(
        (error) => new Error(`Plugin ${plugin.name} failed`, { cause: error }),
      ),
    );
  });

export class PluginRunner extends Effect.Service<PluginRunner>()(
  `${pkg.name}/Plugin`,
  {
    effect: Effect.gen(function* () {
      const options = yield* Options;

      return {
        check: (url: URL) =>
          Effect.raceAll(
            options.plugins.map((plugin) => checkPlugin(plugin, url)),
          ),
      };
    }),
  },
) {}
