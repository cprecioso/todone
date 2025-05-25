import { instancePlugins } from "./base";
import {
  BaseFactories,
  FactoriesToConfigObject,
  InstancingOptions,
} from "./types";

/**
 * Instances the plugins with the configuration, given as an object of
 * plugin names and their configuration.
 *
 * @param factories - An object of plugin names and their factories.
 * @param config - An object of plugin names and their configuration.
 * @param options - Options for instancing the plugins, such as error handling.
 * @returns A promise that resolves to an object of plugin instances.
 */
export const fromObject = async <const Factories extends BaseFactories>(
  factories: Factories,
  config: Record<string, Record<string, unknown>>,
  options?: InstancingOptions,
) =>
  await instancePlugins(
    factories,
    async (name, key) => config[name]?.[key],
    options,
  );

/**
 * Instances the plugins with the configuration, given as an object
 * of plugin names and their type-safe configuration.
 *
 * This is a convenience function that adds type safety to the arguments
 * of the {@link fromObject} function.
 *
 * @param factories - An object of plugin names and their factories.
 * @param config - A type-safe object of plugin names and their configuration.
 * @param options - Options for instancing the plugins, such as error handling.
 * @returns A promise that resolves to an object of plugin instances.
 */
export const fromCode = <const Factories extends BaseFactories>(
  factories: Factories,
  config: FactoriesToConfigObject<Factories>,
  options?: InstancingOptions,
) => fromObject(factories, config, options);

/**
 * Instances the plugins with the configuration, given as a shallow object of
 * environment variables (like [Node.js' `process.env`](https://nodejs.org/api/process.html#processenv)).
 *
 * @param factories - An object of plugin names and their factories.
 * @param config - An shallow object of environment variables (string keys and values).
 * @param options - Options for instancing the plugins, such as error handling.
 * @returns A promise that resolves to an object of plugin instances.
 */
export const fromEnv = async <const Factories extends BaseFactories>(
  factories: Factories,
  config: Partial<Record<string, string>>,
  options?: InstancingOptions,
) =>
  await instancePlugins(
    factories,
    async (_name, _key, { envName }) => {
      if (!envName) return undefined;
      return config[envName];
    },
    options,
  );
