import { map } from "@todone/internal-util/stream";
import { File } from "@todone/types";
import { globbyStream } from "globby";
import * as fs from "node:fs";
import { Readable } from "node:stream";
import { pathToFileURL } from "node:url";

export interface GetFilesOptions {
  cwd: string;
  gitignore: boolean;
}

class RealFile implements File {
  constructor(public readonly url: URL) {}
  isPresent = true;
  getContent() {
    return Readable.toWeb(fs.createReadStream(this.url));
  }
}

export const getFiles = (
  globs: string[],
  { cwd, gitignore }: GetFilesOptions,
) =>
  Readable.toWeb(
    Readable.from(
      globbyStream(globs, {
        cwd,
        onlyFiles: true,
        globstar: true,
        gitignore,
        expandDirectories: true,
        absolute: true,
      }),
    ),
  ).pipeThrough(map((path: string) => new RealFile(pathToFileURL(path))));
