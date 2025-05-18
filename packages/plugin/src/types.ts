import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { PatternProp, PluginInstance } from "@todone/types";
import type { JsonValue } from "type-fest";

export type BaseConfigSchema = {
  schema: StandardSchemaV1<JsonValue | undefined, unknown>;
  envName?: string;
  json?: boolean;
};
export type BasePluginSchema = Readonly<Record<string, BaseConfigSchema>>;

export type BaseOptions = Readonly<Record<string, unknown>>;

export interface PluginFactory<Options extends BaseOptions> {
  readonly pattern?: PatternProp;
  readonly configSchema?: BasePluginSchema;
  make(options: Options): Promise<PluginInstance>;
}
