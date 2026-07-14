import * as t from "#/types";
import * as it from "@cprecioso/async-iterable-helpers";
import { globbyStream } from "globby";
import * as path from "node:path";
import { Config } from "./config";

/** An object representing a file and its contents */
export class File implements t.File {
  static make(cwd: string, localPath: string) {
    const fullPath = path.resolve(cwd, localPath);
    const relativePath = path.relative(cwd, fullPath);
    return new this(relativePath, fullPath);
  }

  private constructor(
    public readonly localPath: string,
    public readonly fullPath: string,
  ) {}
}

export function getFiles(cwd: string, config: Config) {
  return it
    .from(
      globbyStream(config.include.patterns, {
        cwd,
        onlyFiles: true,
        globstar: true,
        gitignore: config.exclude.gitignore,
        expandDirectories: true,
        dot: true,
        ignore: config.exclude.patterns,
      }),
    )
    .pipe(it.map((file) => File.make(cwd, file)));
}
