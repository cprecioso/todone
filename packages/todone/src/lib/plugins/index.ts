import { Checker } from "./checker";
import { Reporter } from "./reporter";

export interface Factory<T, Ctx = void> {
  id: string;
  make: (options: Ctx) => Promise<T>;
}

export interface PluginFactory extends Factory<Plugin, unknown> {
  jsonSchema?: unknown;
}

export interface Plugin {
  checkers?: readonly Factory<Checker>[];
  reporters?: readonly Factory<Reporter>[];
}

export interface Wrapped<T> {
  id: string;
  value: T;
}

export * from "./checker";
export * from "./reporter";
