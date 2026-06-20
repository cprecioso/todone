import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { CheckerResult } from "./plugins/checker";

/** A position in a file */
export interface Position {
  /** The 1-based line number */
  line: number;
  /** The 1-based column number */
  column: number;
}

/** An object representing a file and its contents */
export interface File<E = unknown, R = unknown> {
  readonly location: string;

  /**
   * An [Effect Stream](https://effect.website/docs/stream/introduction/) with
   * the file contents
   */
  readonly getContent: Stream.Stream<Uint8Array, E, R>;
}

/** An object representing a TODO URL as found on a specific file */
export interface Match<TFile extends File = File> {
  file: TFile;
  position: Position;
  url: URL;
}

/**
 * An object representing a TODO URL, all the locations it's been found at, and
 * the {@link Plugin}'s result for it.
 */
export interface Result<TMatch extends Match<File> = Match<File>> {
  /** The URL referred to in the TODO */
  url: URL;
  result: Option.Option<CheckerResult>;
  matches: readonly TMatch[];
}
