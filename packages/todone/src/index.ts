import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import { HydratedConfig } from "./lib/config/hydrate";
import { OptionsService } from "./lib/core/options";
import { Runner } from "./lib/core/runner";
import { getFiles } from "./lib/files";

export const run = ({
  reporter,
  keyword,
  plugins,
  ...config
}: HydratedConfig) =>
  pipe(
    Effect.all([Runner, reporter.create()]),
    Effect.map(([runner, reporter]) =>
      pipe(
        getFiles(config.globs, {
          cwd: process.cwd(),
          gitignore: config.gitignore,
        }),
        Stream.tap(reporter.reportFile),

        runner.getMatches,
        Stream.tap(reporter.reportMatch),

        runner.getResults,
        Stream.tap(reporter.reportResult),
      ),
    ),
    Effect.provide(Runner.Default),
    Effect.provideService(OptionsService, { keyword, plugins }),
    Stream.unwrap,
  );
