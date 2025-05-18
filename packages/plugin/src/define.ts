import { StandardSchemaV1 } from "@standard-schema/spec";
import { PluginInstance } from "@todone/types";
import { Simplify } from "type-fest";
import { BasePluginSchema, PluginFactory } from "./types";

type SchemaToOptions<Schema extends BasePluginSchema | undefined> =
  Schema extends undefined
    ? undefined
    : {
        readonly [K in keyof Schema]: NonNullable<Schema>[K]["schema"] extends StandardSchemaV1<
          any,
          infer T
        >
          ? T
          : never;
      };

export const definePlugin = <Schema extends BasePluginSchema>(
  configSchema: Schema | undefined,
  fn: (options: Simplify<SchemaToOptions<Schema>>) => Promise<PluginInstance>,
): PluginFactory<Simplify<SchemaToOptions<Schema>>> => ({
  configSchema: configSchema,
  make: fn,
});
