import { Plugin, PluginFactory } from "@todone/types";
import * as Effect from "effect/Effect";
import { NodeRuntimeContext } from "./runtime";

/**
 * This type represents a plugin that can be run in the Node.js environment.
 *
 * In general, plugins are designed to be environment-agnostic, but some plugins
 * may rely on Node.js-specific features (like file system access or HTTP clients).
 */
export type AllowedPlugin = PluginFactory<NodeRuntimeContext>;

export const makePlugins = (plugins: readonly AllowedPlugin[]) =>
  Effect.all(plugins.map((plugin) => Effect.provide(Plugin, plugin)));
