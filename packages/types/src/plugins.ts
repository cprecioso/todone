import type { Match } from "./types";

/**
 * Something that can be `test`ed against a string, like a RegExp can.
 * An `URLPattern` is also used often.
 */
export type Searchable = RegExp | Pick<RegExp, "test">;
/** A pattern or array of patterns */
export type PatternProp = Searchable | Searchable[];

/** A plugin for `todone` */
export interface PluginInstance {
  /** The plugin's name, will be used for reporting */
  readonly name: string;
  /** If a match's URL tests true against any of these patterns, it will be processed by this plugin */
  readonly pattern?: PatternProp;
  /** The plugin checks if this URL has expired or not */
  check(match: Match): Promise<PluginResult | null>;
}

export interface PluginResult {
  /** This TODO has expired and needs action */
  isExpired: boolean;
  /** If known, when this TODO expired or will expire */
  expirationDate?: Date;
}
