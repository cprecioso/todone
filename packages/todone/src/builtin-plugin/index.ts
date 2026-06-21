import { PluginFactory } from "#/plugin";
import * as Effect from "effect/Effect";
import { BUILTIN_PLUGIN_ID } from "./base";
import { cliReporter } from "./cli";
import { jsonReporter } from "./json";

const plugin: PluginFactory = {
  id: BUILTIN_PLUGIN_ID,
  create: () => Effect.succeed({ reporters: [cliReporter, jsonReporter] }),
};

export default plugin;
