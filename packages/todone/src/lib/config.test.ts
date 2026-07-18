import { loadConfigFile } from "#/lib/config";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("loadConfigFile", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-config-"));
  });
  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("loads and validates a todone.config.ts file", async () => {
    await fs.writeFile(
      path.join(dir, "todone.config.ts"),
      `export default { keyword: "@FIXME", globs: ["input/**"] };\n`,
    );

    const config = await loadConfigFile(dir);

    expect(config.keyword).toBe("@FIXME");
    expect(config.globs).toEqual(["input/**"]);
    expect(config.gitignore).toBe(true);
    expect(config.plugins).toEqual([]);
  });

  it("returns the defaults when no config file exists", async () => {
    const config = await loadConfigFile(dir);

    expect(config).toEqual({
      keyword: "@TODO",
      gitignore: true,
      globs: ["**/*"],
      plugins: [],
    });
  });
});
