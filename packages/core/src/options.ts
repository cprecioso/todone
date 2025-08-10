import type { Plugin } from "@todone/types";
import * as ConfigError from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as pkg from "../package.json" assert { type: "json" };

export type OptionsType = Context.Tag.Service<Options>;
export class Options extends Context.Tag(`${pkg}/Config`)<
  Options,
  {
    /**
     * Keyword to match against
     *
     * @default "@TODO"
     */
    readonly keyword: string;

    /**
     * Plugins that matches will be run through
     */
    plugins: readonly Layer.Layer<Plugin, ConfigError.ConfigError, never>[];
  }
>() {
  private static defaultOptions: OptionsType = {
    keyword: "@TODO",
    plugins: [],
  };

  static Default = Options.of(this.defaultOptions);

  static provide = (opts: Partial<OptionsType> = {}) =>
    Effect.provideService(
      Options,
      Options.of({ ...this.defaultOptions, ...opts }),
    );
}
