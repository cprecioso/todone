import { PluginFactory } from "#/plugin";
import * as z from "zod";
import { BUILTIN_PLUGIN_ID } from "./base";
import { cliReporter } from "./cli";
import { jsonReporter } from "./json";

export const BuiltinPluginConfig = z.object({
  cli: z.object({
    locale: z.string().optional(),
    onlyExpired: z.boolean().optional().default(false),
  }),
});

const plugin: PluginFactory = {
  id: BUILTIN_PLUGIN_ID,
  jsonSchema: z.toJSONSchema(BuiltinPluginConfig),
  make: async (rawOptions) => {
    const options = BuiltinPluginConfig.parse(rawOptions);
    return { reporters: [cliReporter(options.cli), jsonReporter] };
  },
};

export default plugin;
