/** A position in a file */
export interface Offset {
  line: number;
  column: number;
}

/** An object representing a file and its contents */
export interface File {
  /** The file's location */
  url: URL;
  getContent: () => ReadableStream<Uint8Array>;
  /** Whether the URL represents a currently-present file in the filesystem */
  isPresent: boolean;
}

export interface Match {
  file: File;
  start: Offset;
  end: Offset;
  /** The content of the match */
  url: URL;
}

export interface Result {
  match: Match;
  result: PluginResult | null;
}

/**
 * Something that can be `test`ed against a string, like a RegExp can.
 * An `URLPattern` is also used often.
 */
export type Searchable = RegExp | Pick<RegExp, "test">;

/** A plugin for `todone` */
export interface PluginInstance {
  /** The plugin's name, will be used for reporting */
  readonly name: string;
  /** If a match's URL tests true against any of these patterns, it will be processed by this plugin */
  readonly pattern?: Searchable | Searchable[];
  /** The plugin checks if this URL has expired or not */
  check(match: Match): Promise<PluginResult | null>;
}

export interface PluginResult {
  /** This TODO has expired and needs action */
  isExpired: boolean;
  /** If known, when this TODO expired or will expire */
  expirationDate?: Date;
}
