import * as t from "#/types";
import { globbyStream } from "globby";
import * as path from "node:path";

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

export interface GetFilesOptions {
  /**
   * Working directory to resolve globs against.
   *
   * @default process.cwd()
   */
  cwd: string;

  /**
   * Whether to respect `.gitignore` files.
   *
   * @default true
   */
  gitignore: boolean;
}

export async function* getFiles(
  globs: readonly string[],
  { cwd, gitignore }: GetFilesOptions,
) {
  for await (const file of globbyStream(globs, {
    cwd,
    onlyFiles: true,
    globstar: true,
    gitignore,
    expandDirectories: true,
    dot: true,
  })) {
    yield File.make(cwd, file);
  }
}
