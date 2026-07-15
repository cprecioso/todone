import { jsonReporter } from "#/lib/reporters/json";
import type * as t from "#/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

let log: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  log = vi.spyOn(console, "log").mockImplementation(() => {});
});

const lines = () =>
  (log.mock.calls as unknown[][]).map(
    ([line]) => JSON.parse(line as string) as unknown,
  );

const ctx = {
  warn: vi.fn<(message: string) => void>(),
  info: vi.fn<(message: string) => void>(),
  debug: vi.fn<(message: string) => void>(),
};

const file: t.File = { localPath: "input.txt", fullPath: "/fixture/input.txt" };

const match: t.Match = {
  url: new URL("https://example.com/x"),
  file,
  position: { line: 3, column: 7 },
};

describe("jsonReporter", () => {
  it("emits one JSON line per file with its absolute path", async () => {
    const reporter = jsonReporter();

    await reporter.reportFile!.call(ctx, file);

    expect(lines()).toEqual([{ type: "file", location: "/fixture/input.txt" }]);
  });

  it("rejects files whose path is not absolute", async () => {
    const reporter = jsonReporter();

    await expect(
      Promise.resolve(
        reporter.reportFile!.call(ctx, {
          localPath: "x.txt",
          fullPath: "x.txt",
        }),
      ),
    ).rejects.toThrow(/Expected an absolute path/);
  });

  it("emits matches with the URL as a string and the 1-based position", async () => {
    const reporter = jsonReporter();

    await reporter.reportMatch!.call(ctx, match);

    expect(lines()).toEqual([
      {
        type: "match",
        url: "https://example.com/x",
        location: "/fixture/input.txt",
        line: 3,
        column: 7,
      },
    ]);
  });

  it("emits results with the expiration date as an ISO string", async () => {
    const reporter = jsonReporter();

    await reporter.reportResult!.call(ctx, {
      url: match.url,
      matches: [match],
      result: {
        title: "Example",
        isExpired: true,
        expirationDate: new Date("2000-01-02T03:04:05.000Z"),
      },
    });

    expect(lines()).toEqual([
      {
        type: "result",
        url: "https://example.com/x",
        title: "Example",
        isExpired: true,
        expirationDate: "2000-01-02T03:04:05.000Z",
      },
    ]);
  });

  it("omits the expirationDate key when the result has none", async () => {
    const reporter = jsonReporter();

    await reporter.reportResult!.call(ctx, {
      url: match.url,
      matches: [match],
      result: { title: "Example", isExpired: false },
    });

    expect(lines()).toEqual([
      {
        type: "result",
        url: "https://example.com/x",
        title: "Example",
        isExpired: false,
      },
    ]);
  });

  it("emits nothing for unhandled results", async () => {
    const reporter = jsonReporter();

    await reporter.reportResult!.call(ctx, {
      url: match.url,
      matches: [match],
      result: null,
    });

    expect(log).not.toHaveBeenCalled();
  });
});
