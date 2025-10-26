import * as NodeContext from "@effect/platform-node/NodeContext";
import * as Error from "@effect/platform/Error";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as FileSystem from "@effect/platform/FileSystem";
import * as todone from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import * as Chunk from "effect/Chunk";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { getFiles, GetFilesOptions, LocalFile } from "./lib/get-files";
import * as plugins from "./lib/plugins";

export interface Options extends todone.OptionsType, Partial<GetFilesOptions> {}

const layer = FetchHttpClient.layer.pipe(Layer.provideMerge(NodeContext.layer));

export const makePlugins = (
  pluginList: plugins.AllowedPluginList,
  obj: Record<string, string>,
) =>
  plugins
    .makePlugins(pluginList)
    .pipe(
      Effect.withConfigProvider(
        ConfigProvider.fromMap(new Map(Object.entries(obj))),
      ),
      Effect.provide(layer),
      Effect.runPromise,
    );

export const makeDefaultPlugins = makePlugins.bind(null, defaultPlugins);

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
    Effect.provide(layer),
    Effect.runPromise,
  );
