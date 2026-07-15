import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeLoggerPlugin } from "./logger";

vi.mock("@actions/core", () => ({
  warning: vi.fn<(message: string) => void>(),
  info: vi.fn<(message: string) => void>(),
  debug: vi.fn<(message: string) => void>(),
  error: vi.fn<(message: string) => void>(),
}));

const core = vi.mocked(await import("@actions/core"));

beforeEach(() => {
  vi.clearAllMocks();
});

const ctx = {
  warn: vi.fn<(message: string) => void>(),
  info: vi.fn<(message: string) => void>(),
  debug: vi.fn<(message: string) => void>(),
};

const match = {
  url: new URL("test:x"),
  file: { localPath: "a.txt", fullPath: "/a.txt" },
  position: { line: 3, column: 7 },
};

describe("makeLoggerPlugin", () => {
  it("routes context logging to the Actions toolkit", async () => {
    const plugin = makeLoggerPlugin();

    plugin.warn!.call(ctx, "careful");
    plugin.info!.call(ctx, "fyi");
    plugin.debug!.call(ctx, "verbose");

    expect(core.warning).toHaveBeenCalledExactlyOnceWith("careful");
    expect(core.info).toHaveBeenCalledExactlyOnceWith("fyi");
    expect(core.debug).toHaveBeenCalledExactlyOnceWith("verbose");
  });

  it("logs files and matches as debug lines", async () => {
    const plugin = makeLoggerPlugin();

    await plugin.reportFile!.call(ctx, {
      localPath: "a.txt",
      fullPath: "/a.txt",
    });
    expect(core.debug).toHaveBeenCalledWith("Found file: a.txt");

    await plugin.reportMatch!.call(ctx, match);
    expect(core.debug).toHaveBeenCalledWith("Found match: test:x at a.txt:3:7");
  });

  it("logs handled results with their status and location", async () => {
    const plugin = makeLoggerPlugin();

    await plugin.reportResult!.call(ctx, {
      url: new URL("test:x"),
      matches: [match],
      result: {
        title: "Something",
        isExpired: true,
        expirationDate: new Date("2020-05-06T00:00:00Z"),
      },
    });

    expect(core.info).toHaveBeenCalledExactlyOnceWith(
      "Found: test:x\n\tSomething\n\tExpired\n\t2020-05-06\n\ta.txt:3:7\n",
    );
  });

  it("logs unhandled results", async () => {
    const plugin = makeLoggerPlugin();

    await plugin.reportResult!.call(ctx, {
      url: new URL("test:x"),
      matches: [match],
      result: null,
    });

    expect(core.info).toHaveBeenCalledExactlyOnceWith(
      "Found: test:x\n\tNo plugin responded\n\ta.txt:3:7\n",
    );
  });

  it("logs a run error on reportEnd", async () => {
    const plugin = makeLoggerPlugin();

    await plugin.reportEnd!.call(ctx);
    expect(core.error).not.toHaveBeenCalled();

    await plugin.reportEnd!.call(ctx, new Error("kaboom"));
    expect(core.error).toHaveBeenCalledExactlyOnceWith("Error: kaboom");
  });
});
