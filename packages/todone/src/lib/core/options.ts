import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as pkg from "../../../package.json" with { type: "json" };
import { Plugin } from "../plugins";

export interface Options {
  /**
   * Keyword to match against
   *
   * @default "@TODO"
   */
  readonly keyword: string;

  /**
   * Plugins that matches will be run through
   */
  plugins: readonly Plugin[];
}

/**
 * An [Effect
 * Context](https://effect.website/docs/requirements-management/services/) tag
 * to provide and request the configuration options.
 *
 * @see {@link Options}
 */
export class OptionsService extends Context.Tag(`${pkg.name}/Options`)<
  OptionsService,
  Options
>() {
  private static defaultOptions: Options = {
    keyword: "@TODO",
    plugins: [],
  };

  static Default = OptionsService.of(this.defaultOptions);

  static provide = (opts: Partial<Options> = {}) =>
    Effect.provideService(
      OptionsService,
      OptionsService.of({ ...this.defaultOptions, ...opts }),
    );
}
