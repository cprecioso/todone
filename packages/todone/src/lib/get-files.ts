import * as FileSystem from "@effect/platform/FileSystem";
import { File } from "@todone/types";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { globbyStream } from "globby";
import * as path from "node:path";

export interface GetFilesOptions {
  /**
   * Working directory to resolve globs against.
   *
   * @default process.cwd()
   */
  cwd: string;

  /**
   * Whether to respect `.gitignore` files.
   *
   * @default true
   */
  gitignore: boolean;
}

export class LocalFile {
  readonly #cwd;

  readonly fullPath;

  constructor(cwd: string, localPath: string) {
    this.#cwd = cwd;
    this.fullPath = localPath;
  }

  #_location?: string;
  get location() {
    return (this.#_location ??= path.relative(this.#cwd, this.fullPath));
  }

  readonly getContent = pipe(
    FileSystem.FileSystem,
    Stream.flatMap((fs) => fs.stream(this.fullPath), { switch: true }),
  );
}

LocalFile satisfies { new (...args: any[]): File<unknown, unknown> };

export declare namespace LocalFile {
  export type E = Stream.Stream.Error<LocalFile["getContent"]>;
  export type R = Stream.Stream.Context<LocalFile["getContent"]>;
}

export const getFiles = (
  globs: string[],
  { cwd, gitignore }: GetFilesOptions,
) =>
  Stream.fromAsyncIterable(
    globbyStream(globs, {
      cwd,
      onlyFiles: true,
      globstar: true,
      gitignore,
      expandDirectories: true,
      absolute: true,
    }),
    (error) => new Error("Globber error", { cause: error }),
  ).pipe(
    Stream.mapEffect(Schema.decodeUnknown(Schema.String)),
    Stream.map((path) => new LocalFile(cwd, path)),
  );
