import * as Error from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import { File } from "@todone/types";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { identity } from "effect/Function";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import { globbyStream } from "globby";
import * as path from "node:path";

export interface GetFilesOptions {
  cwd: string;
  gitignore: boolean;
}

export class LocalFile
  implements File<Error.PlatformError, FileSystem.FileSystem>
{
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

  get getContent() {
    return FileSystem.FileSystem.pipe(
      Effect.andThen((fs) => fs.stream(this.fullPath)),
      Stream.flatMap(identity),
    );
  }
}

export class GlobbyError extends Data.Error<{ cause: unknown }> {}

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
    (error) => new GlobbyError({ cause: error }),
  ).pipe(
    Stream.mapEffect(Schema.decodeUnknown(Schema.String)),
    Stream.map((path) => new LocalFile(cwd, path)),
  );
