import { PluginFactory } from "#/plugin";
import * as Effect from "effect/Effect";
import { pipe, satisfies } from "effect/Function";
import { cliReporter } from "./cli";
import { jsonReporter } from "./json";

export default pipe(
  Effect.gen(function* () {
    return {
      reporters: [yield* cliReporter, yield* jsonReporter],
    };
  }),
  satisfies<PluginFactory>(),
);
