import * as ConfigError from "effect/ConfigError";
import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";
import { RuntimeContext } from "../runtime";
import { Checker } from "./checker";
import { Reporter } from "./reporter";

export type CreateEffect<T> = Effect.Effect<
  T,
  ConfigError.ConfigError,
  RuntimeContext | Scope.Scope
>;

export interface Factory<T> {
  id: string;
  create: () => CreateEffect<T>;
}

export type PluginFactory = Factory<Plugin>;

export interface Plugin {
  checkers?: readonly Factory<Checker>[];
  reporters?: readonly Factory<Reporter>[];
}

export interface WrappedPlugin<T> {
  id: string;
  plugin: T;
}

export * from "./checker";
export * from "./reporter";
