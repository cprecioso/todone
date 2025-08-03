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

class RealFile implements File {
  #cwd;
  constructor(
    public readonly localPath: string,
    cwd: string,
  ) {
    this.#cwd = cwd;
  }

  get location() {
    return path.relative(this.#cwd, this.localPath);
  }

  getContent() {
    return Readable.toWeb(fs.createReadStream(this.localPath));
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
  ).pipeThrough(map((path: string) => new RealFile(path, cwd)));
