import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/tsdown";

describe("tsdown defaultConfig", () => {
  it("builds src/index.ts into dist as ESM for Node 24 by default", () => {
    expect(defaultConfig()).toMatchObject({
      entry: ["src/index.ts"],
      outDir: "dist",
      format: ["esm"],
      platform: "node",
      target: "node24",
    });
  });

  it("maps custom entries into src/", () => {
    expect(defaultConfig({ entries: ["bin", "plugin"] }).entry).toEqual([
      "src/bin.ts",
      "src/plugin.ts",
    ]);
  });
});
