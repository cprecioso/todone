import { Options, Runner } from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { RunCommand } from ".";
import { getFiles, LocalFile } from "../../lib/get-files";
import { OutputMode } from "../../lib/output/base";
import { makeOutputCli } from "../../lib/output/cli";
import { OutputJson } from "../../lib/output/json";
import { makePlugins } from "../../lib/plugins";

export const makeRunEffect = ({
  keyword,
  json,
  onlyExpired,
  globs,
  gitignore,
}: RunCommand) => {
  const options = Layer.effect(
    Options,
    Effect.map(makePlugins(defaultPlugins), (plugins) => ({
      keyword,
      plugins,
    })),
  );

  const layer = Layer.mergeAll(
    json ? OutputJson : makeOutputCli(onlyExpired),
    Runner.Default.pipe(Layer.provide(options)),
  );

  return Effect.gen(function* () {
    const runner = yield* Runner;
    const output = yield* OutputMode;

    return yield* pipe(
      getFiles(globs, {
        cwd: process.cwd(),
        gitignore: gitignore,
      }),

      Stream.onStart(output.start),
      Stream.tap(output.fileItem),

      runner.getMatches<LocalFile.E, LocalFile.R, LocalFile>(),
      Stream.tap(output.matchItem),

      runner.getResults<LocalFile.E, LocalFile.R, LocalFile>(),
      Stream.tap(output.resultItem),

      Stream.ensuring(output.end),
      Stream.runFold(
        0,
        (exitCode, { result: { isExpired } }) =>
          exitCode || (isExpired ? 1 : 0),
      ),
    );
  })
    .pipe(Effect.provide(layer))
    .pipe(Effect.withConfigProvider(ConfigProvider.fromEnv()));
};
