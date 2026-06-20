import * as NodeContext from "@effect/platform-node/NodeContext";
import * as HttpClient from "@effect/platform/HttpClient";
import { Plugin, PluginFactory } from "@todone/types";
import * as Effect from "effect/Effect";
import type { NonEmptyTuple } from "type-fest";

export type AllowedPlugin = PluginFactory<
  NodeContext.NodeContext | HttpClient.HttpClient
>;

export type AllowedPluginList = NonEmptyTuple<AllowedPlugin>;

export const makePlugins = (plugins: AllowedPluginList) =>
  Effect.all(plugins.map((plugin) => Effect.provide(Plugin, plugin)));
