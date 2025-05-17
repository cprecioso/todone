import { assert } from "@std/assert";
import { File } from "@todone/types";
import nodeFs from "fs";
import { globbyStream } from "globby";
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
    return Readable.toWeb(nodeFs.createReadStream(this.url, "utf-8"));
  }
}

export const getFiles = async function* (
  globs: string[],
  { cwd, gitignore }: GetFilesOptions,
): AsyncIterable<File> {
  for await (const path of globbyStream(globs, {
    cwd,
    onlyFiles: true,
    globstar: true,
    gitignore,
    expandDirectories: true,
    absolute: true,
  })) {
    assert(typeof path === "string");
    const url = pathToFileURL(path);
    yield new RealFile(url);
  }
};
