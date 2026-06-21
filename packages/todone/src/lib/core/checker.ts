import * as pkg from "#/package.json" with { type: "json" };
import type { Checker } from "#/plugin";
import { WrappedPlugin } from "#/plugin";
import * as Effect from "effect/Effect";
import { identity, pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import { OptionsService } from "./options";

export class PluginChecker extends Effect.Service<PluginChecker>()(
  `${pkg.name}/PluginChecker`,
  {
    effect: Effect.gen(function* () {
      const checkers = yield* getAllCheckers();

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

const getAllCheckers = () =>
  Effect.gen(function* () {
    const options = yield* OptionsService;
    return yield* Effect.all(
      options.plugins
        .flatMap((p) => p.checkers ?? [])
        .map((c) =>
          Effect.map(
            c.create(),
            (checker): WrappedPlugin<Checker> => ({
              id: c.id,
              plugin: checker,
            }),
          ),
        ),
    );
  });

const checkMatchWithPlugin = (url: URL) => (plugin: WrappedPlugin<Checker>) =>
  pipe(
    plugin.plugin.checkMatch({ url }),
    Effect.mapError(
      (cause) =>
        new Error(
          `Plugin ${plugin.id} failed to check match for URL ${url.toString()}`,
          { cause },
        ),
    ),
  );
