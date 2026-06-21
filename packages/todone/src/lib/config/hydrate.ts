import builtinPlugin from "#/builtin-plugin";
import { Plugin, PluginFactory } from "#/plugin";
import * as Terminal from "@effect/platform/Terminal";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";
import { BUILTIN_PLUGIN_ID } from "../../builtin-plugin/base";
import { Config } from "./schema";

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
  const configWithBuiltin: Config["plugins"] = {
    [BUILTIN_PLUGIN_ID]: {},
    ...config.plugins,
  };

  const pluginEffects = Object.entries(configWithBuiltin).map(
    ([name, pluginConfig]) =>
      pipe(
        loadPlugin(pluginConfig?.import ?? name),
        Effect.andThen((factory) =>
          Effect.mapError(
            factory.create(),
            (error) =>
              new Error(`Plugin ${factory.id ?? name} failed to initialize`, {
                cause: error,
              }),
          ),
        ),
        Effect.withConfigProvider(
          ConfigProvider.fromJson(pluginConfig?.options ?? {}),
        ),
      ),
  );

  return Effect.all(pluginEffects);
};

const loadPlugin = (name: string, importName = name) =>
  importName === BUILTIN_PLUGIN_ID
    ? loadBuiltinPlugin()
    : loadExternalPlugin(name, importName);

const loadBuiltinPlugin = () => Effect.succeed(builtinPlugin);

const loadExternalPlugin = (name: string, importName: string) =>
  pipe(
    Effect.tryPromise({
      try: async () => {
        const mod = await import(importName);
        const factory = mod.default || mod;
        return factory as PluginFactory;
      },
      catch: (error) =>
        new Error(
          `Failed to load plugin ${name} with \`import(${JSON.stringify(importName)})\``,
          { cause: error },
        ),
    }),
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

    if (!reporter.includes("/")) {
      reporter = `${BUILTIN_PLUGIN_ID}/${reporter}`;
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
