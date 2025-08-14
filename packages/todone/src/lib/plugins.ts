import * as NodeContext from "@effect/platform-node/NodeContext";
import * as HttpClient from "@effect/platform/HttpClient";
import { Plugin, PluginFactory } from "@todone/types";
import * as Effect from "effect/Effect";

export type AllowedPlugin = PluginFactory<
  NodeContext.NodeContext | HttpClient.HttpClient
>;

type NonEmpty<T> = readonly [T, ...(readonly T[])];

export type AllowedPluginList = NonEmpty<AllowedPlugin>;

export const makePlugins = (plugins: NonEmpty<AllowedPlugin>) =>
  Effect.all(plugins.map((plugin) => Effect.provide(Plugin, plugin)));
