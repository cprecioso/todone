import type { CheckerResult } from "./plugin";

/** A position in a file */
export interface Position {
  /** The 1-based line number */
  line: number;
  /** The 1-based column number */
  column: number;
}

/** An object representing a file and its contents */
export interface File {
  localPath: string;
  fullPath: string;
}

/** An object representing a TODO URL as found on a specific file */
export interface Match {
  file: File;
  position: Position;
  url: URL;
}

/**
 * An object representing a TODO URL, the location it's been found at, and the
 * {@link Plugin}'s result for it.
 */
export interface Result {
  url: URL;
  matches: Match[];
  result: CheckerResult | null;
}
