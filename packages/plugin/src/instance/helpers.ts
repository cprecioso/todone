import { JsonObject } from "type-fest";
import { instancePlugins } from "./base";
import {
  BaseFactories,
  FactoriesToConfigObject,
  InstancingOptions,
} from "./types";

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

export const fromJSON = async <const Factories extends BaseFactories>(
  factories: Factories,
  config: Record<string, JsonObject>,
  options?: InstancingOptions,
) => fromObject(factories, config, options);

export const fromCode = async <const Factories extends BaseFactories>(
  factories: Factories,
  config: FactoriesToConfigObject<Factories>,
  options?: InstancingOptions,
) => fromObject(factories, config as any, options);

export const fromEnv = async <const Factories extends BaseFactories>(
  factories: Factories,
  config: Partial<Record<string, string>>,
  options?: InstancingOptions,
) =>
  await instancePlugins(
    factories,
    async (_name, _key, { json, envName }) => {
      if (!envName) return undefined;
      const rawValue = config[envName];
      const value = json && rawValue ? JSON.parse(rawValue) : rawValue;
      return value;
    },
    options,
  );
