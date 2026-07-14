import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defaultConfig } from "../src/typedoc";

let dir: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-typedoc-"));
});
afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

const configFor = async (pkgJson: unknown) => {
  await fs.writeFile(
    path.join(dir, "package.json"),
    JSON.stringify(pkgJson, null, 2),
  );
  // The factory resolves ./package.json relative to the config file's URL.
  return defaultConfig(pathToFileURL(path.join(dir, "typedoc.config.ts")).href);
};

describe("typedoc defaultConfig", () => {
  it("maps dist exports back to src entry points", async () => {
    const config = await configFor({
      name: "fixture",
      exports: {
        "./package.json": "./package.json",
        ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
        "./sub": "./dist/sub.js",
      },
    });

    expect(config.entryPoints).toEqual(["src/index.ts", "src/sub.ts"]);
  });

  it("follows import/default conditions and dedups against main", async () => {
    const config = await configFor({
      name: "fixture",
      main: "./dist/index.js",
      exports: {
        ".": { import: "./dist/index.js" },
      },
    });

    expect(config.entryPoints).toEqual(["src/index.ts"]);
  });

  it("returns no entry points for private packages", async () => {
    const config = await configFor({
      name: "fixture",
      private: true,
      exports: { ".": "./dist/index.js" },
    });

    expect(config.entryPoints).toEqual([]);
  });

  it("requires a package name", async () => {
    await expect(configFor({ exports: {} })).rejects.toThrow(
      /package\.json#name not found/,
    );
  });
});
