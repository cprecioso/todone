import * as ConfigError from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as pkg from "../package.json" with { type: "json" };

/** A position in a file */
export interface t {
  /** The 1-based line number */
  line: number;
  /** The 1-based column number */
  column: number;
}

/** An object representing a file and its contents */
export interface File<E, R> {
  /**
   * An [Effect Stream](https://effect.website/docs/stream/introduction/) with
   * the file contents
   */
  readonly getContent: Stream.Stream<Uint8Array, E, R>;
}

/** An object representing a TODO URL as found on a specific file */
export interface Match<E, R, TFile extends File<E, R>> {
  file: TFile;
  position: t;
  url: URL;
}

/**
 * An object representing a TODO URL, all the locations it's been found at, and
 * the {@link Plugin}'s result for it.
 */
export interface Result<E, R, TFile extends File<E, R>> {
  /** The URL referred to in the TODO */
  url: URL;
  result: PluginResult | null;
  matches: readonly Match<E, R, TFile>[];
}

/**
 * Something that can be `test`ed against a string, like a RegExp can. An
 * [`URLPattern`](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)
 * is also used often.
 */
export type Searchable = RegExp | Pick<RegExp, "test">;

/**
 * A Plugin factory is an [Effect
 * Layer](https://effect.website/docs/requirements-management/layers/) that
 * provides a {@link PluginInstance} as a service
 */
export type PluginFactory<R> = Layer.Layer<Plugin, ConfigError.ConfigError, R>;

/**
 * A Plugin represents the implementation of a kind of check that can be run
 * against a TODO URL.
 *
 * For example, a GitHub plugin might check if a URL points to a GitHub issue or
 * PR, and if so, whether that issue or PR is still open.
 */
export interface PluginInstance {
  /** The plugin's name, will be used for reporting */
  readonly name: string;

  /**
   * If a match's URL tests true against any of these patterns, it will be
   * processed by this plugin
   *
   * If empty, the plugin will be run against all URLs.
   */
  readonly pattern?: Searchable | Searchable[];

  /**
   * An [Effect](https://effect.website/docs/getting-started/the-effect-type/)
   * for checking if a URL should be considered as expired or not.
   */
  check(options: { url: URL }): Effect.Effect<PluginResult, unknown>;
}

/**
 * The [Effect Service](https://effect.website/docs/requirements-management/services/) tag
 * to provide and access a {@link PluginInstance}.
 */
export class Plugin extends Context.Tag(`${pkg.name}/Plugin`)<
  Plugin,
  PluginInstance
>() {}

/**
 * The result of running a Plugin's check against a URL, indicating whether the
 * TODO is expired or not, and some metadata about the check.
 */
export interface PluginResult {
  /**
   * A human title for the reference URL
   *
   * For example, for a GitHub issue URL, this might be the issue title.
   */
  title: string;

  /**
   * Whether this TODO has expired and needs action
   *
   * This has different meanings depending on the plugin. For example, for a
   * GitHub issue, it might mean the issue is marked as closed. For a calendar
   * event, it might mean the event date has passed.
   */
  isExpired: boolean;

  /**
   * If known, when this TODO expired or will expire. It's fine to leave this
   * empty if not known for sure.
   *
   * This only makes sense for scheduled TODOs, like times or deadlines.
   */
  expirationDate?: Date;
}
