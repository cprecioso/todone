import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { globbyStream } from "globby";

/** An object representing a file and its contents */
export class File {
  static make(cwd: string, localPath: string) {
    return Effect.map(Path.Path, (path) => {
      const fullPath = path.resolve(cwd, localPath);
      const relativePath = path.relative(cwd, fullPath);
      return new this(relativePath, fullPath);
    });
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

export const getFiles = (
  globs: readonly string[],
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
        dot: true,
      }),
      (error) => new Error("Globber error", { cause: error }),
    ),
    Stream.mapEffect(Schema.decodeUnknown(Schema.String)),
    Stream.mapEffect((path) => File.make(cwd, path)),
  );
