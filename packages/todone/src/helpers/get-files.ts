import { map } from "@todone/internal-util/stream";
import { File } from "@todone/types";
import { globbyStream } from "globby";
import * as fs from "node:fs";
import * as path from "node:path";
import { Readable } from "node:stream";

export interface GetFilesOptions {
  cwd: string;
  gitignore: boolean;
}

export class LocalFile implements File {
  readonly #cwd;
  readonly #localPath;

  constructor(cwd: string, localPath: string) {
    this.#cwd = cwd;
    this.#localPath = localPath;
  }

  #_location?: string;
  get location() {
    return (this.#_location ??= path.relative(this.#cwd, this.#localPath));
  }

  getContent() {
    return Readable.toWeb(fs.createReadStream(this.#localPath));
  }
}

export const getFiles = (
  globs: string[],
  { cwd, gitignore }: GetFilesOptions,
) =>
  ReadableStream.from(
    globbyStream(globs, {
      cwd,
      onlyFiles: true,
      globstar: true,
      gitignore,
      expandDirectories: true,
      absolute: true,
    }),
  ).pipeThrough(map((path: string) => new LocalFile(cwd, path)));
