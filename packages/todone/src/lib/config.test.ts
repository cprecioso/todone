import { ConfigSchema, loadConfigFile } from "#/lib/config";
import type { Plugin } from "#/plugin";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("ConfigSchema", () => {
  it("fills in defaults for an empty config", () => {
    expect(ConfigSchema.parse({})).toEqual({
      keyword: "@TODO",
      gitignore: true,
      globs: ["**/*"],
      plugins: [],
    });
  });

  it("keeps explicit values", () => {
    const plugin: Plugin = { name: "test" };
    const config = ConfigSchema.parse({
      keyword: "*TODO",
      gitignore: false,
      globs: ["src/**"],
      plugins: [plugin],
    });

    expect(config.keyword).toBe("*TODO");
    expect(config.gitignore).toBe(false);
    expect(config.globs).toEqual(["src/**"]);
    expect(config.plugins[0]).toBe(plugin);
  });

  it("rejects values of the wrong type", () => {
    expect(() => ConfigSchema.parse({ keyword: 123 })).toThrow();
    expect(() => ConfigSchema.parse({ globs: "**/*" })).toThrow();
  });
});

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
