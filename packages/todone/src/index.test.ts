import { run } from "#/index";
import { PluginError } from "#/lib/container";
import type { Plugin } from "#/plugin";
import type * as t from "#/types";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let dir: string;
let previousCwd: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-run-"));
  previousCwd = process.cwd();
  process.chdir(dir);
});
afterEach(async () => {
  process.chdir(previousCwd);
  await fs.rm(dir, { recursive: true, force: true });
});

const baseConfig = {
  keyword: "@TODO",
  gitignore: false,
  globs: ["**/*"],
};

/** A reporter that records every hook invocation in order. */
const makeCapturingReporter = () => {
  const events: unknown[][] = [];
  const reporter: Plugin = {
    name: "capturing-reporter",
    checkMatch: vi.fn(async () => null),
    reportFile: async (file) => void events.push(["file", file.localPath]),
    reportMatch: async (match) => void events.push(["match", match.url.href]),
    reportResult: async (result) =>
      void events.push(["result", result.url.href]),
    reportEnd: async (error) => void events.push(["end", error]),
  };
  return { events, reporter };
};

describe("run", () => {
  it("checks each unique URL once and aggregates duplicate matches", async () => {
    await fs.writeFile(
      path.join(dir, "a.txt"),
      "@TODO test:one\n@TODO test:two\n",
    );
    await fs.writeFile(path.join(dir, "b.txt"), "@TODO test:one\n");

    const checkMatch = vi.fn(async ({ url }: { url: URL }) => ({
      title: url.href,
      isExpired: url.href === "test:one",
    }));

    const results = await run({
      ...baseConfig,
      plugins: [{ name: "checker", checkMatch }],
    });

    expect(checkMatch).toHaveBeenCalledTimes(2);

    const byUrl = new Map(results.map((result) => [result.url.href, result]));
    expect(byUrl.size).toBe(2);

    const one = byUrl.get("test:one")!;
    expect(one.matches).toHaveLength(2);
    expect(one.matches.map((m) => m.file.localPath).sort()).toEqual([
      "a.txt",
      "b.txt",
    ]);
    expect(one.result).toEqual({ title: "test:one", isExpired: true });

    const two = byUrl.get("test:two")!;
    expect(two.matches).toHaveLength(1);
    expect(two.result).toEqual({ title: "test:two", isExpired: false });
  });

  it("returns a null result for URLs no plugin handles", async () => {
    await fs.writeFile(path.join(dir, "a.txt"), "@TODO test:unhandled\n");

    const results = await run({ ...baseConfig, plugins: [] });

    expect(results).toHaveLength(1);
    expect(results[0]!.result).toBeNull();
  });

  it("routes reporting to the forced reporter but URL checks to the configured plugins", async () => {
    await fs.writeFile(path.join(dir, "a.txt"), "@TODO test:one\n");

    const configuredCheck = vi.fn(async () => ({
      title: "found",
      isExpired: false,
    }));
    const configuredReportFile = vi.fn(async () => {});
    const { events, reporter } = makeCapturingReporter();

    const results = await run(
      {
        ...baseConfig,
        plugins: [
          {
            name: "configured",
            checkMatch: configuredCheck,
            reportFile: configuredReportFile,
          },
        ],
      },
      { forcedReporter: reporter },
    );

    // The configured plugin still checks URLs...
    expect(configuredCheck).toHaveBeenCalledTimes(1);
    expect(results[0]!.result).toEqual({ title: "found", isExpired: false });

    // ...but reporting goes only to the forced reporter.
    expect(configuredReportFile).not.toHaveBeenCalled();
    expect(reporter.checkMatch).not.toHaveBeenCalled();
    expect(events).toEqual([
      ["file", "a.txt"],
      ["match", "test:one"],
      ["result", "test:one"],
      ["end", undefined],
    ]);
  });

  it("reports the error to reportEnd and rethrows when a plugin fails", async () => {
    await fs.writeFile(path.join(dir, "a.txt"), "@TODO test:boom\n");

    const { events, reporter } = makeCapturingReporter();
    const failure = new Error("kaboom");

    const rejection = run(
      {
        ...baseConfig,
        plugins: [
          {
            name: "explodes",
            checkMatch: async () => {
              throw failure;
            },
          },
        ],
      },
      { forcedReporter: reporter },
    );

    await expect(rejection).rejects.toBeInstanceOf(PluginError);

    const [event, error] = events.at(-1) as [string, unknown];
    expect(event).toBe("end");
    expect(error).toBeInstanceOf(PluginError);
    expect((error as PluginError).cause).toBe(failure);
  });
});
