import { File } from "./files";
import type { CheckerResult } from "./plugins";

/** A position in a file */
export interface Position {
  /** The 1-based line number */
  line: number;
  /** The 1-based column number */
  column: number;
}

/** An object representing a TODO URL as found on a specific file */
export interface Match {
  file: File;
  position: Position;
  url: URL;
}

/**
 * An object representing a TODO URL, all the locations it's been found at, and
 * the {@link Plugin}'s result for it.
 */
export interface Result {
  /** The URL referred to in the TODO */
  url: URL;
  match: Match;
  result: CheckerResult | null;
}
