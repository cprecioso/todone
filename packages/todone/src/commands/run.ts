import * as Error from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import { Options, Runner } from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import { Command, Option } from "clipanion";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { getFiles, LocalFile } from "../lib/get-files";
import { OutputMode } from "../lib/output/base";
import { makeOutputCli } from "../lib/output/cli";
import { OutputJson } from "../lib/output/json";
import { makePlugins } from "../lib/plugins";
import { EffectComand } from "./common";

export class RunCommand extends EffectComand {
  static paths = [Command.Default, ["run"]];

  keyword = Option.String("-k,--keyword", "@TODO");

  onlyExpired = Option.Boolean("--only-expired", false, {
    description: "Only show expired items (ignored if --json is used)",
  });

  json = Option.Boolean("--json", false, {
    description: "Output results as newline-delimited JSON",
  });

  gitignore = Option.Boolean("--gitignore", true, {
    description:
      "Respect .gitignore patterns (on by default, use --no-gitignore to disable)",
  });

  globs = Option.Rest({ name: "globs", required: 1 });

  get effect() {
    const args = this;

    const plugins = makePlugins(defaultPlugins, ConfigProvider.fromEnv());
    const options = Layer.succeed(Options, {
      keyword: args.keyword,
      plugins,
    });

    const layer = Layer.mergeAll(
      args.json ? OutputJson : makeOutputCli(args.onlyExpired),
      Layer.provide(Runner.Default, options),
    );

    return Effect.gen(function* () {
      const runner = yield* Runner;
      const output = yield* OutputMode;

      return yield* pipe(
        getFiles(args.globs, {
          cwd: process.cwd(),
          gitignore: args.gitignore,
        }),
        Stream.onStart(output.start),
        Stream.tap(output.fileItem),

        runner.getMatches<
          Error.PlatformError,
          FileSystem.FileSystem,
          LocalFile
        >(),
        Stream.tap(output.matchItem),

        runner.getResults(),
        Stream.tap(output.resultItem),

        Stream.ensuring(output.end),
        Stream.runFold(
          0,
          (exitCode, { result: { isExpired } }) =>
            exitCode || (isExpired ? 1 : 0),
        ),
      );
    }).pipe(Effect.provide(layer));
  }
}
