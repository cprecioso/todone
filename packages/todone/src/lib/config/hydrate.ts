import builtinPlugin from "#/builtin-plugin";
import { Plugin, PluginFactory } from "#/plugin";
import { BUILTIN_PLUGIN_ID } from "../../builtin-plugin/base";
import { Config } from "./schema";

export type HydratedConfig = Awaited<ReturnType<typeof hydrateConfig>>;

export const hydrateConfig = async (rawConfig: unknown) => {
  const config = Config.parse(rawConfig);

  const plugins = await hydratePlugins(config);
  const reporter = await hydrateReporter(config.reporter, plugins);

  return { ...config, reporter, plugins };
};

const hydratePlugins = async (config: Config) => {
  const configWithBuiltin: Config["plugins"] = {
    [BUILTIN_PLUGIN_ID]: {},
    ...config.plugins,
  };

  return await Promise.all(
    Object.entries(configWithBuiltin).map(async ([name, config]) => {
      const { import: importName = name, options: pluginConfig } = config ?? {};
      try {
        const factory = await loadPlugin(importName);
        return await factory.make(pluginConfig);
      } catch (error) {
        throw new Error(`Failed to load plugin ${name}`, { cause: error });
      }
    }),
  );
};

const loadPlugin = async (importName: string) =>
  importName === BUILTIN_PLUGIN_ID
    ? builtinPlugin
    : await loadExternalPlugin(importName);

const loadExternalPlugin = async (importName: string) => {
  try {
    const mod = await import(importName);
    const factory = mod.default || mod;
    return factory as PluginFactory;
  } catch (error) {
    throw new Error(`Failed to \`import(${JSON.stringify(importName)})\``, {
      cause: error,
    });
  }
};

const hydrateReporter = async (
  reporter: string,
  plugins: readonly Plugin[],
) => {
  if (reporter === "auto") {
    if (process.stdout.isTTY) {
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
    throw new Error(`Reporter ${reporter} not found in loaded plugins`);
  }

  return reporterPlugin;
};
