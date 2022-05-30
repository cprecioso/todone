import assert from "node:assert/strict";
import { Readable } from "node:stream";
import type { BufferFile, StreamFile } from "vinyl";

export function assertStreamFile(
  file: BufferFile | StreamFile,
  message?: string
): asserts file is StreamFile {
  if (file.isBuffer()) {
    // @ts-expect-error
    file.contents = Readable.from(file.contents);
  }

  assert(file.isStream(), message);
  return file;
}
