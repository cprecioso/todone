import type * as db from "caniuse-lite";
import { describe, expect, it } from "vitest";
import { checkFeatureSupport, getBrowsers } from "./lib";

const featureWith = (status: string): db.Feature =>
  ({
    title: "Synthetic feature",
    stats: { chrome: { "100": status } },
  }) as unknown as db.Feature;

const chrome100 = { browser: "chrome", version: "100" };

const support = (status: string, flags: string[] = []) =>
  checkFeatureSupport(featureWith(status), new Set(flags), chrome100);

describe("checkFeatureSupport", () => {
  it("treats plain support and partial support as supported", () => {
    expect(support("y")).toBe(true);
    expect(support("a")).toBe(true);
  });

  it("treats everything else as unsupported", () => {
    expect(support("n")).toBe(false);
    expect(support("u")).toBe(false);
    expect(support("p")).toBe(false);
    expect(support("n d")).toBe(false);
  });

  it("rejects disabled-by-default features unless ignore-disabled is set", () => {
    expect(support("y d")).toBe(false);
    expect(support("y d", ["ignore-disabled"])).toBe(true);
  });

  it("rejects prefixed support when no-prefix is set", () => {
    expect(support("y x")).toBe(true);
    expect(support("y x", ["no-prefix"])).toBe(false);
  });

  it("rejects polyfilled support when no-polyfill is set", () => {
    expect(support("a p")).toBe(true);
    expect(support("a p", ["no-polyfill"])).toBe(false);
  });

  it("rejects partial support when full is set", () => {
    expect(support("a")).toBe(true);
    expect(support("a", ["full"])).toBe(false);
    expect(support("y", ["full"])).toBe(true);
  });

  it("applies flags together", () => {
    expect(support("a x", ["no-prefix", "full"])).toBe(false);
    expect(support("y", ["no-prefix", "no-polyfill", "full"])).toBe(true);
  });

  it("throws for a browser or version missing from the stats", () => {
    expect(() =>
      checkFeatureSupport(featureWith("y"), new Set(), {
        browser: "netscape",
        version: "4",
      }),
    ).toThrow();
  });
});

describe("getBrowsers", () => {
  it("splits browserslist output into browser and version", () => {
    const browsers = getBrowsers(["chrome 100"]);
    expect(browsers).toEqual([{ browser: "chrome", version: "100" }]);
  });

  it("resolves multiple queries", () => {
    const browsers = getBrowsers(["chrome 100", "firefox 100"]);
    expect(browsers).toContainEqual({ browser: "chrome", version: "100" });
    expect(browsers).toContainEqual({ browser: "firefox", version: "100" });
  });
});
