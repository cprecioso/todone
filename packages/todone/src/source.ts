import type { File } from "@todone/types";
import vfs from "vinyl-fs";

export const makeSource = (globs: string[]) => () =>
  vfs.src(globs, {
    buffer: false,
    cwd: process.cwd(),
    cwdbase: true,
  }) as AsyncIterable<File>;
