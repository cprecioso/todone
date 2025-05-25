import { PluginResult } from "./plugins";

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
