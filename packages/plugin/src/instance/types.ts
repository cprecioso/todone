import { PluginFactory } from "../types";

/** @internal */
export type BaseFactory = PluginFactory<any>;

/** @internal */
export type FactoryToConfigObject<Factory extends BaseFactory> =
  Factory extends PluginFactory<infer T> ? T : never;

/** @internal */
export type BaseFactories = Readonly<Record<string, BaseFactory>>;

/** @internal */
export type FactoriesToConfigObject<Factories extends BaseFactories> = {
  readonly [K in keyof Factories]: FactoryToConfigObject<Factories[K]>;
};

export type InstancingOptions = {
  /**
   * What to do when the options could not be validated against the schema.
   * You can either throw an error to stop the instancing process,
   * or return `void` to skip the plugin.
   *
   * @param name - The name of the plugin that failed to validate.
   * @param error - The error that was thrown during validation.
   * @returns `void` to skip the plugin, or throw an error to stop the instancing process.
   */
  onConfigError?: (name: string, error: unknown) => never | void;

  /**
   * What to do when the plugin throws an error during instancing.
   * You can either throw an error to stop the instancing process,
   * or return `void` to skip the plugin.
   *
   * @param name - The name of the plugin that failed to instantiate.
   * @param error - The error that was thrown during instancing.
   * @returns `void` to skip the plugin, or throw an error to stop the instancing process.
   */
  onInstancingError?: (name: string, error: unknown) => never | void;
};
