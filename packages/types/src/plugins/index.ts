import * as ConfigError from "effect/ConfigError";
import * as Effect from "effect/Effect";
import { Checker } from "./checker";

export type PluginFactory<R> = Effect.Effect<
  Plugin,
  ConfigError.ConfigError,
  R
>;

export interface Plugin {
  checkers?: readonly Checker[];
}

export * from "./checker";
