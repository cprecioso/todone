import * as core from "@actions/core";
import * as glob from "@actions/glob";
import * as s from "@todone/internal-util/stream";
import * as t from "@todone/types";
import { execa } from "execa";
import * as fs from "node:fs";
import * as path from "node:path";
import { Readable } from "node:stream";
import { sha } from "../input";

const cwd = process.cwd();

export class GitHubFile implements t.File {
  readonly #localPath;

  constructor(localPath: string) {
    this.#localPath = localPath;
  }

  #_location?: string;
  get location() {
    return (this.#_location ??= this.#localPath.startsWith(cwd)
      ? path.relative(cwd, this.#localPath)
      : this.#localPath);
  }

  async getUrl(line?: number) {
    try {
      const basename = path.basename(this.#localPath);
      const dirname = path.dirname(this.#localPath);

      const commitArg = sha ? [`--commit=${sha}`] : [];
      const lineSuffx = line ? `:${line}` : "";

      const { stdout } = await execa({
        cwd: dirname,
      })`gh browse ${basename}${lineSuffx} --no-browser ${commitArg}`;

      return stdout;
    } catch (error) {
      core.warning(
        new Error(
          `Failed to get GitHub file URL from local path ${JSON.stringify(this.#localPath)}`,
          { cause: error },
        ),
      );
    }
  }

  getContent() {
    return Readable.toWeb(fs.createReadStream(this.#localPath));
  }
}

export const makeFileStream = (globs: string) =>
  s
    .create(async () => {
      const globber = await glob.create(globs, { matchDirectories: false });
      const iterable = globber.globGenerator();
      return ReadableStream.from(iterable);
    })
    .pipeThrough(s.map((path) => new GitHubFile(path)));
