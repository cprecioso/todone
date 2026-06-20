import { run } from "#/index";
import { hydrateConfig } from "#/lib/config/hydrate";
import { loadConfigFile } from "#/lib/config/load";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { RunCommand } from "./index";

export default ({ reporter: overrideReporter }: RunCommand) =>
  Effect.gen(function* () {
    const rawConfig = yield* loadConfigFile();
    const rawConfigWithOverrides = {
      ...rawConfig,
      reporter: overrideReporter ?? rawConfig.reporter,
    };
    const config = yield* hydrateConfig(rawConfigWithOverrides);

    return yield* pipe(
      run(config),
      Stream.runFold(
        0,
        (accExitCode, { result }) =>
          accExitCode ||
          Option.match(result, {
            onSome: ({ isExpired }) => (isExpired ? 1 : 0),
            onNone: () => 0,
          }),
      ),
    );
  });
