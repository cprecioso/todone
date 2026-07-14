import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src/vitest";

describe("vitest defaultConfig", () => {
  it("pins the determinism environment", () => {
    expect(defaultConfig().test.env).toEqual({
      TZ: "UTC",
      NO_COLOR: "1",
      FORCE_COLOR: "0",
    });
  });

  it("passes setup files through", () => {
    expect(defaultConfig({ setupFiles: ["./test/setup.ts"] }).test.setupFiles) //
      .toEqual(["./test/setup.ts"]);
    expect(defaultConfig().test.setupFiles).toEqual([]);
  });
});
