/** A position in a file */
export interface Offset {
  line: number;
  column: number;
}

/** An object representing a file and its contents */
export interface File {
  readonly getContent: (this: this) => ReadableStream<Uint8Array>;
}

export interface Match<FileType extends File> {
  file: FileType;
  position: Offset;
}

export interface Result<FileType extends File> {
  url: URL;
  result: PluginResult | null;
  matches: readonly Match<FileType>[];
}

/**
 * Something that can be `test`ed against a string, like a RegExp can. An
 * `URLPattern` is also used often.
 */
export type Searchable = RegExp | Pick<RegExp, "test">;

/** A plugin for `todone` */
export interface PluginInstance {
  /** The plugin's name, will be used for reporting */
  readonly name: string;

  /**
   * If a match's URL tests true against any of these patterns, it will be
   * processed by this plugin
   */
  readonly pattern?: Searchable | Searchable[];

  /** The plugin checks if this URL has expired or not */
  check(options: { url: URL }): Promise<PluginResult | null>;
}

export interface PluginResult {
  /** A human title for the reference URL */
  title: string;
  /** This TODO has expired and needs action */
  isExpired: boolean;
  /** If known, when this TODO expired or will expire */
  expirationDate?: Date;
}
