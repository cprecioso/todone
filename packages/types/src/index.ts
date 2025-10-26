import * as ConfigError from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as pkg from "../package.json" with { type: "json" };

/** A position in a file */
export interface t {
  line: number;
  column: number;
}

/** An object representing a file and its contents */
export interface File<E, R> {
  readonly getContent: Stream.Stream<Uint8Array, E, R>;
}

export interface Match<E, R, TFile extends File<E, R>> {
  file: TFile;
  position: t;
}

export interface Result<E, R, TFile extends File<E, R>> {
  url: URL;
  result: PluginResult | null;
  matches: readonly Match<E, R, TFile>[];
}

/**
 * Something that can be `test`ed against a string, like a RegExp can. An
 * `URLPattern` is also used often.
 */
export type Searchable = RegExp | Pick<RegExp, "test">;

export type PluginFactory<R> = Layer.Layer<Plugin, ConfigError.ConfigError, R>;

export class Plugin extends Context.Tag(`${pkg.name}/Plugin`)<
  Plugin,
  {
    /** The plugin's name, will be used for reporting */
    readonly name: string;

    /**
     * If a match's URL tests true against any of these patterns, it will be
     * processed by this plugin
     */
    readonly pattern?: Searchable | Searchable[];

    /** The plugin checks if this URL has expired or not */
    check(options: { url: URL }): Effect.Effect<PluginResult, unknown>;
  }
>() {}

export interface PluginResult {
  /** A human title for the reference URL */
  title: string;
  /** This TODO has expired and needs action */
  isExpired: boolean;
  /** If known, when this TODO expired or will expire */
  expirationDate?: Date;
}
