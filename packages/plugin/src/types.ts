import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { PluginInstance } from "@todone/types";

export type BaseConfigSchema = {
  /**
   * A [Standard Schema-compatible](https://github.com/standard-schema/standard-schema#what-schema-libraries-implement-the-spec) schema,
   * that can validate and transform the user's configuration into a usable format for the plugin.
   */
  schema: StandardSchemaV1<unknown, unknown>;

  /**
   * When instancing the plugin with the {@link fromEnv} function,
   * this is the name of the environment variable that you expect to contain
   * the value for this option. The string value will be passed to the schema as input.
   */
  envName?: string;
};

/** An object of option names and their schemas */
export type BasePluginSchema = Readonly<Record<string, BaseConfigSchema>>;

/** The basic Options type, just an object with string keys */
export type BaseOptions = Readonly<Record<string, unknown>>;

/**
 * A standard way to define a plugin and which options it needs to work
 *
 * @see {@link definePlugin}
 * @template Options - The options that we'll pass to create the plugin.
 */
export interface PluginFactory<Options extends BaseOptions> {
  /**
   * The schema of how the {@link Options} will be created from the user's configuration
   *
   * It's an object with string keys, and each value is an object of {@link BaseConfigSchema} type.
   */
  readonly configSchema: BasePluginSchema | null;
  make(options: Options): Promise<PluginInstance>;
}
