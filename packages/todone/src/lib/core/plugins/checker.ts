import * as pkg from "#/package.json" with { type: "json" };
import type { Checker } from "#/plugin";
import * as Effect from "effect/Effect";
import { identity, pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import { PluginFailedError } from "./base";
import { PluginProvider } from "./provider";

export class PluginChecker extends Effect.Service<PluginChecker>()(
  `${pkg.name}/PluginChecker`,
  {
    dependencies: [PluginProvider.Default],
    effect: Effect.gen(function* () {
      const { checkers } = yield* PluginProvider;

      return {
        checkMatch: (url: URL) =>
          pipe(
            Stream.fromIterable(checkers),
            Stream.mapEffect(checkMatchWithPlugin(url), {
              concurrency: "unbounded",
              unordered: true,
            }),
            Stream.filterMap(identity),
            Stream.runHead,
          ),
      };
    }),
  },
) {}

const checkMatchWithPlugin = (url: URL) => (plugin: Checker) =>
  pipe(
    plugin.checkMatch({ url }),
    Effect.mapError(
      (cause) =>
        new PluginFailedError({
          pluginName: plugin.name,
          url: url.toString(),
          cause,
        }),
    ),
  );
