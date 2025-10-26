import type { PluginInstance } from "@todone/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as pkg from "../package.json" with { type: "json" };

export interface OptionsType {
  /**
   * Keyword to match against
   *
   * @default "@TODO"
   */
  readonly keyword: string;

  /**
   * Plugins that matches will be run through
   */
  plugins: readonly PluginInstance[];
}

/**
 * An Effect Context tag to provide and request the configuration options.
 */
export class Options extends Context.Tag(`${pkg}/Config`)<
  Options,
  OptionsType
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
