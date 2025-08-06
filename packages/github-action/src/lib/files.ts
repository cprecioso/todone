import * as glob from "@actions/glob";
import * as s from "@todone/internal-util/stream";
import * as t from "@todone/types";
import * as fs from "node:fs";
import * as path from "node:path";
import { Readable } from "node:stream";

const cwd = process.cwd();
class RealFile implements t.File {
  constructor(public readonly localPath: string) {}

  get location() {
    return this.localPath.startsWith(cwd)
      ? path.relative(cwd, this.localPath)
      : this.localPath;
  }

  getContent() {
    return Readable.toWeb(fs.createReadStream(this.localPath));
  }
}

export const makeFileStream = (globs: string) =>
  s
    .create(async () => {
      const globber = await glob.create(globs, { matchDirectories: false });
      const iterable = globber.globGenerator();
      return ReadableStream.from(iterable);
    })
    .pipeThrough(s.map((path) => new RealFile(path)));
