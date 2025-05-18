import { StandardSchemaV1 } from "@standard-schema/spec";
import { truthy } from "@todone/util/bool";
import { BaseConfigSchema } from "../types";
import { BaseFactories, InstancingOptions } from "./types";

const parseStandardSchema = async (
  name: string,
  schema: StandardSchemaV1,
  value: unknown,
) => {
  const result = await schema["~standard"].validate(value);
  if (result.issues) {
    throw new AggregateError(result.issues, `Validation failed for ${name}`);
  }
  return result.value;
};

export const instancePlugins = async <const Factories extends BaseFactories>(
  factories: Factories,
  getConfig: (
    name: string,
    key: string,
    schema: BaseConfigSchema,
  ) => Promise<unknown>,
  {
    onConfigError = (name, error) => {
      throw new Error(`Error in config for plugin ${name}`, { cause: error });
    },
    onInstancingError = (name, error) => {
      throw new Error(`Error instancing plugin ${name}`, { cause: error });
    },
  }: InstancingOptions = {},
) =>
  (
    await Promise.all(
      Object.entries(factories).map(async ([name, factory]) => {
        try {
          const pluginConfig = Object.fromEntries(
            await Promise.all(
              Object.entries(factory.configSchema ?? {}).map(
                async ([key, schema]) => {
                  const input = await getConfig(name, key, schema);
                  const result = await parseStandardSchema(
                    `${name}.${key}`,
                    schema.schema,
                    input,
                  );
                  return [key, result] as const;
                },
              ),
            ),
          );

          try {
            return await factory.make(pluginConfig);
          } catch (error) {
            onInstancingError(name, error);
          }
        } catch (error) {
          onConfigError(name, error);
        }
      }),
    )
  ).filter(truthy);
