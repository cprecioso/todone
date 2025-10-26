import * as Error from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as todone from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import { PluginInstance } from "@todone/types";
import * as Chunk from "effect/Chunk";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Stream from "effect/Stream";
import { getFiles, GetFilesOptions, LocalFile } from "./lib/get-files";
import { AllowedPlugin, makePlugins as makePluginsEffect } from "./lib/plugins";
import { NodeRuntimeLayer } from "./lib/runtime";

export type { AllowedPlugin } from "./lib/plugins";

export interface Options
  extends Partial<todone.OptionsType>,
    Partial<GetFilesOptions> {}

/**
 * Given some plugin factories, provides them with the necessary configuration
 * to create a plugin instance.
 */
export const makePlugins = (
  plugins: readonly AllowedPlugin[],
  /** Configuration for the plugins */
  obj: Record<string, string>,
): Promise<PluginInstance[]> =>
  makePluginsEffect(plugins).pipe(
    Effect.withConfigProvider(
      ConfigProvider.fromMap(new Map(Object.entries(obj))),
    ),
    Effect.provide(NodeRuntimeLayer),
    Effect.runPromise,
  );

/**
 * Creates plugin instances for the default todone plugins ({@link "@todone/default-plugins"}).
 */
export const makeDefaultPlugins = (
  /** Configuration for the plugins */
  obj: Record<string, string>,
) => makePlugins(defaultPlugins, obj);

/**
 * Runs the analysis for the given globs and options.
 *
 * @param globs - The glob patterns to analyze.
 * @param options - The options to configure the analysis.
 */
export const run = (
  globs: string[],
  { cwd = process.cwd(), gitignore = true, ...options }: Options,
) =>
  pipe(
    todone.Runner,
    Effect.andThen((runner) =>
      getFiles(globs, { cwd, gitignore }).pipe(
        runner.getMatches<
          Error.PlatformError,
          FileSystem.FileSystem,
          LocalFile
        >(),
        runner.getResults<LocalFile.E, LocalFile.R, LocalFile>(),
        Stream.runCollect,
        Effect.andThen(Chunk.toArray),
      ),
    ),
    Effect.provide(todone.Runner.Default),
    todone.Options.provide(options),
    Effect.provide(NodeRuntimeLayer),
    Effect.runPromise,
  );
