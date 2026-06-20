import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { globbyStream } from "globby";

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

/** An object representing a file and its contents */
export class File {
  static make(cwd: string, localPath: string) {
    return Effect.map(
      Path.Path,
      (path) => new this(localPath, path.join(cwd, localPath)),
    );
  }

  private constructor(
    public readonly localPath: string,
    public readonly fullPath: string,
  ) {}

  /**
   * An [Effect Stream](https://effect.website/docs/stream/introduction/) with
   * the file contents
   */
  readonly getContent = pipe(
    FileSystem.FileSystem,
    Stream.flatMap((fs) => fs.stream(this.fullPath), { switch: true }),
  );
}

export const getFiles = (
  globs: string[],
  { cwd, gitignore }: GetFilesOptions,
) =>
  pipe(
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
    ),
    Stream.mapEffect(Schema.decodeUnknown(Schema.String)),
    Stream.mapEffect((path) => File.make(cwd, path)),
  );
