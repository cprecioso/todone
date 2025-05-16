import { File } from "@todone/types";
import { globbyStream } from "globby";
import assert from "node:assert/strict";
import nodeFs from "node:fs";
import { pathToFileURL } from "node:url";

export interface GetFilesOptions {
  cwd: string;
  gitignore: boolean;
}

class RealFile implements File {
  constructor(public readonly url: URL) {}
  isPresent = true;
  async getContent() {
    return nodeFs.createReadStream(this.url, "utf-8");
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
