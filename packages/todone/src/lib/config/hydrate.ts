import builtinPlugin from "#/builtin-plugin";
import { Plugin, PluginFactory } from "#/plugin";
import * as Terminal from "@effect/platform/Terminal";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";
import { BUILTIN_PLUGIN_NAME, Config } from "./schema";

export type HydratedConfig = Effect.Effect.Success<
  ReturnType<typeof hydrateConfig>
>;

export const hydrateConfig = (rawConfig: unknown) =>
  Effect.gen(function* () {
    const config = yield* Schema.decodeUnknown(Config)(rawConfig);

    const plugins = yield* hydratePlugins(config);
    const reporter = yield* hydrateReporter(config.reporter, plugins);

    return { ...config, reporter, plugins };
  });

const hydratePlugins = (config: Config) => {
  const configWithBuiltin = {
    [BUILTIN_PLUGIN_NAME]: {},
    ...config.plugins,
  };

  const pluginEffects = Object.entries(configWithBuiltin).map(
    ([name, pluginConfig]) =>
      pipe(
        name === BUILTIN_PLUGIN_NAME
          ? Effect.succeed(builtinPlugin as PluginFactory)
          : loadExternalPlugin(name),
        Effect.flatten,
        Effect.mapError(
          (error) =>
            new Error(`Plugin ${name} failed to initialize`, {
              cause: error,
            }),
        ),
        Effect.withConfigProvider(ConfigProvider.fromJson(pluginConfig ?? {})),
        Effect.scoped,
      ),
  );

  return Effect.all(pluginEffects);
};

const loadExternalPlugin = (name: string) =>
  pipe(
    Effect.tryPromise({
      try: async () => {
        const mod = await import(name);
        const factory = "default" in mod ? mod.default : mod;
        return factory as PluginFactory;
      },
      catch: (error) =>
        new Error(`Failed to load plugin ${name}`, { cause: error }),
    }),
    Effect.tap((factory) =>
      Effect.isEffect(factory)
        ? Effect.void
        : Effect.fail(
            new Error(`Plugin ${name} does not export a valid factory`),
          ),
    ),
  );

const hydrateReporter = (reporter: string, plugins: readonly Plugin[]) =>
  Effect.gen(function* () {
    if (reporter === "auto") {
      const term = yield* Terminal.Terminal;
      if (term.isTTY) {
        reporter = "cli";
      } else {
        reporter = "json";
      }
    }

    const reporterPlugin = plugins
      .flatMap((plugin) => plugin.reporters ?? [])
      .find((r) => r.id === reporter);

    if (!reporterPlugin) {
      return yield* Effect.fail(
        new Error(`Reporter ${reporter} not found in loaded plugins`),
      );
    }

    return reporterPlugin;
  });
