import { UnknownRecord } from "type-fest";
import { PluginFactory } from "../types";

export type BaseFactory = PluginFactory<UnknownRecord>;
export type FactoryToConfigObject<Factory extends BaseFactory> =
  Factory extends PluginFactory<infer T> ? T : never;

export type BaseFactories = Readonly<Record<string, BaseFactory>>;
export type FactoriesToConfigObject<Factories extends BaseFactories> = {
  readonly [K in keyof Factories]: FactoryToConfigObject<Factories[K]>;
};

export type InstancingOptions = {
  onConfigError?: (name: string, error: unknown) => never | void;
  onInstancingError?: (name: string, error: unknown) => never | void;
};
