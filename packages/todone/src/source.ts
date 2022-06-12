import type { File, FileSource } from "@todone/types";
import vfs from "vinyl-fs";

export const makeSource =
  (globs: string[]): FileSource =>
  () =>
    vfs.src(globs, {
      buffer: false,
      cwd: process.cwd(),
      cwdbase: true,
    }) as AsyncIterable<File>;
