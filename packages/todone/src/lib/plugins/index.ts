import * as ConfigError from "effect/ConfigError";
import * as Effect from "effect/Effect";
import { NodeRuntimeContext } from "../runtime";
import { Checker } from "./checker";
import { Reporter } from "./reporter";

export type PluginFactory = Effect.Effect<
  Plugin,
  ConfigError.ConfigError,
  NodeRuntimeContext
>;

export interface Plugin {
  checkers?: readonly Checker[];
  reporters?: readonly Reporter[];
}

export * from "./checker";
export * from "./reporter";
