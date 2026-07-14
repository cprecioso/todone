import { cliReporterPlugin } from "#/lib/reporters/cli";
import type { PluginContext } from "#/plugin";
import type * as t from "#/types";
import { beforeEach, describe, expect, it, vi } from "vitest";

const makeContext = () =>
  ({
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }) satisfies PluginContext;

const makeResult = (
  url: string,
  result: t.Result["result"],
  positions: [line: number, column: number][] = [[1, 1]],
): t.Result => ({
  url: new URL(url),
  matches: positions.map(([line, column]) => ({
    url: new URL(url),
    file: { localPath: "input.txt", fullPath: "/fixture/input.txt" },
    position: { line, column },
  })),
  result,
});

let log: ReturnType<typeof vi.spyOn>;
let warn: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  log = vi.spyOn(console, "log").mockImplementation(() => {});
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

const logged = () => (log.mock.calls as unknown[][]).map(([line]) => line);

describe("cliReporterPlugin unhandled URLs", () => {
  const unhandled = makeResult("test:mystery", null, [[3, 7]]);

  it("throws an explanatory error by default", async () => {
    const reporter = cliReporterPlugin();

    await expect(
      reporter.reportResult!.call(makeContext(), unhandled),
    ).rejects.toThrow(
      "No plugin returned a result for test:mystery (input.txt:3:7)",
    );
  });

  it("warns through the plugin context with `warn`", async () => {
    const reporter = cliReporterPlugin({ unhandledUrls: "warn" });
    const context = makeContext();

    await reporter.reportResult!.call(context, unhandled);

    expect(context.warn).toHaveBeenCalledExactlyOnceWith(
      "no plugin handled test:mystery (input.txt:3:7)",
    );
    expect(logged()).toEqual([]);
  });

  it("stays silent with `ignore`", async () => {
    const reporter = cliReporterPlugin({ unhandledUrls: "ignore" });
    const context = makeContext();

    await reporter.reportResult!.call(context, unhandled);

    expect(context.warn).not.toHaveBeenCalled();
    expect(logged()).toEqual([]);
  });
});

describe("cliReporterPlugin output", () => {
  it("prints every match location, the URL, the status, and the date", async () => {
    const reporter = cliReporterPlugin({ locale: "en-US" });

    await reporter.reportResult!.call(
      makeContext(),
      makeResult(
        "test:expired-thing",
        {
          title: "Expired thing",
          isExpired: true,
          expirationDate: new Date("2000-01-02T00:00:00Z"),
        },
        [
          [1, 4],
          [9, 2],
        ],
      ),
    );

    expect(logged()).toEqual([
      "input.txt:1:4",
      "input.txt:9:2",
      "\ttest:expired-thing",
      "\tEXPIRED",
      "\texpired on 1/2/2000",
      "",
    ]);
  });

  it("prints future expirations as not expired", async () => {
    const reporter = cliReporterPlugin({ locale: "en-US" });

    await reporter.reportResult!.call(
      makeContext(),
      makeResult("test:fresh", {
        title: "Fresh thing",
        isExpired: false,
        expirationDate: new Date("2999-12-31T00:00:00Z"),
      }),
    );

    expect(logged()).toEqual([
      "input.txt:1:1",
      "\ttest:fresh",
      "\tNot expired yet",
      "\twill expire on 12/31/2999",
      "",
    ]);
  });

  it("omits the date line when there is no expiration date", async () => {
    const reporter = cliReporterPlugin();

    await reporter.reportResult!.call(
      makeContext(),
      makeResult("test:dateless", { title: "Dateless", isExpired: false }),
    );

    expect(logged()).toEqual([
      "input.txt:1:1",
      "\ttest:dateless",
      "\tNot expired yet",
      "",
    ]);
  });

  it("hides non-expired results when onlyExpired is set, but still counts them", async () => {
    const reporter = cliReporterPlugin({ onlyExpired: true });
    const context = makeContext();

    await reporter.reportResult!.call(
      context,
      makeResult("test:fresh", { title: "Fresh", isExpired: false }),
    );
    expect(logged()).toEqual([]);

    await reporter.reportEnd!.call(context);
    expect(logged()).toEqual([
      "Analysis complete:\n" +
        "  0 files found\n" +
        "  0 matches found\n" +
        "  1 results found\n" +
        "  0 expired results found",
    ]);
  });
});

describe("cliReporterPlugin summary", () => {
  it("counts files, matches, results, and expired results", async () => {
    const reporter = cliReporterPlugin();
    const context = makeContext();

    const file: t.File = { localPath: "a.txt", fullPath: "/a.txt" };
    await reporter.reportFile!.call(context, file);
    await reporter.reportFile!.call(context, file);

    const expired = makeResult("test:expired", {
      title: "Expired",
      isExpired: true,
    });
    await reporter.reportMatch!.call(context, expired.matches[0]!);
    await reporter.reportResult!.call(context, expired);

    log.mockClear();
    await reporter.reportEnd!.call(context);

    expect(logged()).toEqual([
      "Analysis complete:\n" +
        "  2 files found\n" +
        "  1 matches found\n" +
        "  1 results found\n" +
        "  1 expired results found",
    ]);
  });

  it("prints the error when the run failed", async () => {
    const reporter = cliReporterPlugin();

    await reporter.reportEnd!.call(makeContext(), new Error("kaboom"));

    expect(error).toHaveBeenCalledExactlyOnceWith("Error: Error: kaboom");
    expect(warn).not.toHaveBeenCalled();
  });
});
