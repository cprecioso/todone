import * as todone from "@todone/core";
import defaultPlugins from "@todone/default-plugins";
import { Plugin } from "@todone/types";
import * as Chunk from "effect/Chunk";
import * as ConfigError from "effect/ConfigError";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { getFiles, GetFilesOptions } from "./lib/get-files";
import * as plugins from "./lib/plugins";

export interface Options extends todone.OptionsType, Partial<GetFilesOptions> {}

export const makePlugins = (
  pluginList: plugins.AllowedPluginList,
  obj: Record<string, string>,
): Layer.Layer<Plugin, ConfigError.ConfigError, never>[] =>
  plugins.makePlugins(
    pluginList,
    ConfigProvider.fromMap(new Map(Object.entries(obj))),
  );

export const makeDefaultPlugins = (obj: Record<string, string>) =>
  makePlugins(defaultPlugins, obj);

export const run = (
  globs: string[],
  { cwd = process.cwd(), gitignore = true, ...options }: Options,
) =>
  todone.Runner.pipe(
    Effect.andThen((runner) =>
      getFiles(globs, { cwd, gitignore }).pipe(
        runner.getMatches,
        runner.getResults,
        Stream.runCollect,
        Effect.andThen(Chunk.toArray),
      ),
    ),
    Effect.provide(todone.Runner.Default),
    todone.Options.provide(options),
    Effect.runPromise,
  );
