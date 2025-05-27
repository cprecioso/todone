import * as glob from "@actions/glob";
import * as s from "@todone/internal-util/stream";
import * as t from "@todone/types";
import * as fs from "node:fs";
import { relative as relativePath } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";

const cwd = process.cwd();
export const humanFilename = (file: t.File) => {
  if (!file.isPresent) return file.url.toString();
  const url = new URL(file.url);
  if (url.protocol !== "file:") return file.url.toString();
  const path = fileURLToPath(url);
  return path.startsWith(cwd) ? relativePath(cwd, path) : path;
};

class RealFile implements t.File {
  constructor(public readonly url: URL) {}
  isPresent = true;
  getContent() {
    return Readable.toWeb(fs.createReadStream(this.url));
  }
}

export const makeFileStream = (globs: string) =>
  s
    .create(async () => {
      const globber = await glob.create(globs);
      const iterable = globber.globGenerator();
      return ReadableStream.from(iterable);
    })
    .pipeThrough(s.map((path) => new RealFile(pathToFileURL(path))));
