import { StandardSchemaV1 } from "@standard-schema/spec";
import { PluginInstance } from "@todone/types";
import { Simplify } from "type-fest";
import { BasePluginSchema, PluginFactory } from "./types";

type SchemaToOptions<Schema extends BasePluginSchema | null> =
  Schema extends null
    ? null
    : {
        readonly [K in keyof Schema]: NonNullable<Schema>[K]["schema"] extends StandardSchemaV1<
          any,
          infer T
        >
          ? T
          : never;
      };

/**
 * A standard way to define a plugin and which options it needs to work.
 * We recommend using this function to define your plugins,
 * as it provides a clear structure and type safety for the plugin's configuration.
 *
 * @param configSchema - The schema of how the {@link Options} will be created from the user's configuration.
 * @param fn - A function that takes the options and returns a promise of a plugin instance.
 * @returns A plugin factory that can be used to create plugin instances.
 */
export const definePlugin = <Schema extends BasePluginSchema | null>(
  configSchema: Schema,
  fn: (
    /** The parsed and validated options as defined in the schema */
    options: Simplify<SchemaToOptions<Schema>>,
  ) => Promise<PluginInstance>,
): PluginFactory<Simplify<SchemaToOptions<Schema>>> => ({
  configSchema: configSchema,
  make: fn,
});
