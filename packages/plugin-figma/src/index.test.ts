import { describe, expect, it, vi } from "vitest";
import figmaPlugin from "./index";

const context = () => ({
  warn: vi.fn<(message: string) => void>(),
  info: vi.fn<(message: string) => void>(),
  debug: vi.fn<(message: string) => void>(),
});

const check = (url: string) =>
  figmaPlugin({ token: "test-token" }).checkMatch!.call(context(), {
    url: new URL(url),
  });

describe("figmaPlugin URL matching", () => {
  // None of these URLs match the pattern, so no network request is made.
  it("ignores non-figma URLs", async () => {
    await expect(check("https://example.com/file/abc#1")).resolves.toBeNull();
  });

  it("ignores /design/ URLs (only /file/ is supported)", async () => {
    await expect(
      check("https://www.figma.com/design/abc/My-File?node-id=1#2"),
    ).resolves.toBeNull();
  });

  it("ignores file URLs without a comment hash", async () => {
    await expect(check("https://figma.com/file/abc")).resolves.toBeNull();
  });

  it("ignores deeper file paths", async () => {
    await expect(
      check("https://figma.com/file/abc/extra#1"),
    ).resolves.toBeNull();
  });
});

describe("figmaPlugin without a token", () => {
  it("emits a warning at construction time", () => {
    const emitWarning = vi
      .spyOn(process, "emitWarning")
      .mockImplementation(() => {});

    figmaPlugin();

    expect(emitWarning).toHaveBeenCalledOnce();
    expect(emitWarning.mock.calls[0]![1]).toMatchObject({
      code: "TODONE_FIGMA_NO_TOKEN",
    });
  });

  it("fails any figma URL check", async () => {
    vi.spyOn(process, "emitWarning").mockImplementation(() => {});
    const plugin = figmaPlugin();

    await expect(
      plugin.checkMatch!.call(context(), {
        url: new URL("https://figma.com/file/abc#1"),
      }),
    ).rejects.toThrow(/A Figma token is required/);
  });

  it("still ignores non-figma URLs", async () => {
    vi.spyOn(process, "emitWarning").mockImplementation(() => {});
    const plugin = figmaPlugin();

    await expect(
      plugin.checkMatch!.call(context(), { url: new URL("test:x") }),
    ).resolves.toBeNull();
  });
});
