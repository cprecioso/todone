import { describe, expect, it, vi } from "vitest";
import caniusePlugin from "./index";

const context = () => ({ warn: vi.fn(), info: vi.fn(), debug: vi.fn() });

const check = (url: string, browserslist: string | readonly string[]) =>
  caniusePlugin({ browserslist }).checkMatch!.call(context(), {
    url: new URL(url),
  });

describe("caniusePlugin URL matching", () => {
  it("ignores non-caniuse URLs", async () => {
    await expect(check("https://example.com/flexbox", "chrome 100")) //
      .resolves.toBeNull();
  });

  it("ignores caniuse URLs without a single feature segment", async () => {
    await expect(check("https://caniuse.com/", "chrome 100")) //
      .resolves.toBeNull();
    await expect(check("https://caniuse.com/a/b", "chrome 100")) //
      .resolves.toBeNull();
  });

  it("accepts www and http variants", async () => {
    await expect(
      check("http://www.caniuse.com/flexbox", "chrome 100"),
    ).resolves.toMatchObject({ isExpired: true });
  });

  it("throws for an unknown feature slug", async () => {
    await expect(
      check("https://caniuse.com/definitely-not-a-feature", "chrome 100"),
    ).rejects.toThrow();
  });
});

describe("caniusePlugin support evaluation", () => {
  // These cases rely on historical caniuse data, which never changes for
  // released browser versions, so they stay stable across DB updates.
  it("is expired when every target browser supports the feature", async () => {
    await expect(
      check("https://caniuse.com/flexbox", ["chrome 100", "firefox 100"]),
    ).resolves.toMatchObject({
      title: expect.stringContaining("Flexible Box Layout"),
      isExpired: true,
    });
  });

  it("is not expired while some target browser lacks the feature", async () => {
    // CSS container queries shipped in Chrome 105.
    await expect(
      check("https://caniuse.com/css-container-queries", [
        "chrome 100",
        "chrome 120",
      ]),
    ).resolves.toMatchObject({ isExpired: false });
  });

  it("applies URL hash flags", async () => {
    // Chrome 20 only had prefixed, old-spec flexbox ("a x").
    await expect(
      check("https://caniuse.com/flexbox", "chrome 20"),
    ).resolves.toMatchObject({ isExpired: true });
    await expect(
      check("https://caniuse.com/flexbox#no-prefix", "chrome 20"),
    ).resolves.toMatchObject({ isExpired: false });
    await expect(
      check("https://caniuse.com/flexbox#full", "chrome 20"),
    ).resolves.toMatchObject({ isExpired: false });
    await expect(
      check("https://caniuse.com/flexbox#full,no-prefix", "chrome 100"),
    ).resolves.toMatchObject({ isExpired: true });
  });

  it("prefers the explicit browserslist option over the environment", async () => {
    vi.stubEnv("BROWSERSLIST", "chrome 120");

    // With the explicit option, chrome 100 is the target: not expired.
    await expect(
      check("https://caniuse.com/css-container-queries", "chrome 100"),
    ).resolves.toMatchObject({ isExpired: false });

    // Without it, the environment wins: chrome 120 supports the feature.
    const plugin = caniusePlugin();
    await expect(
      plugin.checkMatch!.call(context(), {
        url: new URL("https://caniuse.com/css-container-queries"),
      }),
    ).resolves.toMatchObject({ isExpired: true });
  });
});
