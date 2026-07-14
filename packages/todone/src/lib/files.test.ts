import { File, getFiles } from "#/lib/files";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("File.make", () => {
  it("resolves a relative path against the cwd", () => {
    const file = File.make("/base/dir", "sub/file.txt");

    expect(file.localPath).toBe("sub/file.txt");
    expect(file.fullPath).toBe("/base/dir/sub/file.txt");
  });

  it("relativizes an absolute path inside the cwd", () => {
    const file = File.make("/base/dir", "/base/dir/file.txt");

    expect(file.localPath).toBe("file.txt");
    expect(file.fullPath).toBe("/base/dir/file.txt");
  });

  it("normalizes paths that traverse directories", () => {
    const file = File.make("/base/dir", "sub/../file.txt");

    expect(file.localPath).toBe("file.txt");
    expect(file.fullPath).toBe("/base/dir/file.txt");
  });
});

describe("getFiles", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-files-"));
    await fs.mkdir(path.join(dir, "sub"));
    await fs.writeFile(path.join(dir, "a.txt"), "a");
    await fs.writeFile(path.join(dir, "sub", "b.txt"), "b");
    await fs.writeFile(path.join(dir, ".hidden.txt"), "h");
    await fs.writeFile(path.join(dir, "ignored.txt"), "i");
    await fs.writeFile(path.join(dir, ".gitignore"), "ignored.txt\n");
  });
  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  const localPaths = async (globs: readonly string[], gitignore: boolean) => {
    const paths: string[] = [];
    for await (const file of getFiles(globs, { cwd: dir, gitignore })) {
      expect(file.fullPath).toBe(path.join(dir, file.localPath));
      paths.push(file.localPath);
    }
    return paths.sort();
  };

  it("walks the tree, including dotfiles, and respects .gitignore", async () => {
    expect(await localPaths(["**/*"], true)).toEqual([
      ".gitignore",
      ".hidden.txt",
      "a.txt",
      "sub/b.txt",
    ]);
  });

  it("includes ignored files when gitignore is disabled", async () => {
    expect(await localPaths(["**/*"], false)).toEqual([
      ".gitignore",
      ".hidden.txt",
      "a.txt",
      "ignored.txt",
      "sub/b.txt",
    ]);
  });

  it("honors narrower globs", async () => {
    expect(await localPaths(["sub/**"], false)).toEqual(["sub/b.txt"]);
  });
});
