import * as NodeContext from "@effect/platform-node/NodeContext";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import { Plugin, PluginFactory } from "@todone/types";
import * as ConfigError from "effect/ConfigError";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Layer from "effect/Layer";

export type AllowedPlugin = PluginFactory<
  NodeContext.NodeContext | HttpClient.HttpClient
>;

type NonEmpty<T> = readonly [T, ...(readonly T[])];

export type AllowedPluginList = NonEmpty<AllowedPlugin>;

export const makePlugins = (
  plugins: NonEmpty<AllowedPlugin>,
  configProvider: ConfigProvider.ConfigProvider,
): Layer.Layer<Plugin, ConfigError.ConfigError, never>[] => {
  const pluginRuntimeLayer = Layer.mergeAll(
    Layer.setConfigProvider(configProvider),
    FetchHttpClient.layer,
    NodeContext.layer,
  );

  return plugins.map((plugin) => Layer.provide(plugin, pluginRuntimeLayer));
};
