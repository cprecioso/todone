import { Plugin } from "@todone/types";
import * as Effect from "effect/Effect";
import * as pkg from "../../package.json" with { type: "json" };
import { Options } from "../options";

export class PluginProvider extends Effect.Service<PluginProvider>()(
  `${pkg.name}/PluginProvider`,
  {
    effect: Effect.gen(function* () {
      const options = yield* Options;

      return options.plugins.reduce<Required<Plugin>>(
        (combinedPlugin, currentPlugin) => ({
          checkers: [
            ...combinedPlugin.checkers,
            ...(currentPlugin.checkers ?? []),
          ],
          reporters: [
            ...combinedPlugin.reporters,
            ...(currentPlugin.reporters ?? []),
          ],
        }),
        { checkers: [], reporters: [] },
      );
    }),
  },
) {}
