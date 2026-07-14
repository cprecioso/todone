import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureDir, normalize, runCli } from "./run-cli";

// Each test spawns the built CLI, which compiles the fixture's TS config with
// jiti on the fly — leave room for cold starts on slow CI machines.
const SLOW = { timeout: 60_000 };

describe("todone run", () => {
  it("prints locations, statuses, dates, and a summary", SLOW, async () => {
    const dir = fixtureDir("basic");
    const { stdout, stderr, exitCode } = await runCli(dir, [
      "run",
      "--locale",
      "en-US",
    ]);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(stdout).toMatchSnapshot();
  });

  it("hides unexpired results with --only-expired", SLOW, async () => {
    const dir = fixtureDir("basic");
    const { stdout, stderr, exitCode } = await runCli(dir, [
      "run",
      "--only-expired",
      "--locale",
      "en-US",
    ]);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(stdout).not.toContain("fixture:fresh-1");
    expect(stdout).toMatchSnapshot();
  });

  it("treats a custom keyword literally", SLOW, async () => {
    const dir = fixtureDir("keyword");
    const { stdout, stderr, exitCode } = await runCli(dir, ["run"]);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(stdout).toContain("fixture:expired-star");
    expect(stdout).not.toContain("fixture:ignored");
    expect(stdout).toMatchSnapshot();
  });
});

describe("todone run --json", () => {
  it("emits NDJSON for files, matches, and handled results", SLOW, async () => {
    const dir = fixtureDir("basic");
    const { stdout, stderr, exitCode } = await runCli(dir, ["run", "--json"]);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
    expect(normalize(stdout, dir)).toMatchSnapshot();
  });

  it("silently skips unhandled URLs", SLOW, async () => {
    const dir = fixtureDir("unhandled");
    const { stdout, stderr, exitCode } = await runCli(dir, ["run", "--json"]);

    expect(stderr).toBe("");
    expect(exitCode).toBe(0);

    const items = stdout
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { type: string; url?: string });
    expect(items.filter((item) => item.type === "match")).toHaveLength(2);
    expect(items.filter((item) => item.type === "result")).toEqual([
      expect.objectContaining({ url: "fixture:handled-1" }),
    ]);
  });
});

describe("todone run --check", () => {
  it(
    "exits 1 when an expired TODO exists, printing nothing",
    SLOW,
    async () => {
      const dir = fixtureDir("basic");
      const { stdout, stderr, exitCode } = await runCli(dir, [
        "run",
        "--check",
      ]);

      expect(stdout).toBe("");
      expect(stderr).toBe("");
      expect(exitCode).toBe(1);
    },
  );

  it("exits 0 when nothing is expired", SLOW, async () => {
    const dir = fixtureDir("check-fresh");
    const { stdout, stderr, exitCode } = await runCli(dir, ["run", "--check"]);

    expect(stdout).toBe("");
    expect(stderr).toBe("");
    expect(exitCode).toBe(0);
  });
});

describe("todone run --unhandled-urls", () => {
  it("fails the run by default", SLOW, async () => {
    const dir = fixtureDir("unhandled");
    const { stderr, exitCode } = await runCli(dir, ["run"]);

    expect(exitCode).toBe(1);
    // Not a snapshot: clipanion prints a stack trace with absolute paths.
    expect(stderr).toContain(
      "No plugin returned a result for nothing:handles-this",
    );
  });

  it("warns and exits 0 with `warn`", SLOW, async () => {
    const dir = fixtureDir("unhandled");
    const { stdout, stderr, exitCode } = await runCli(dir, [
      "run",
      "--unhandled-urls",
      "warn",
    ]);

    expect(exitCode).toBe(0);
    expect(stderr).toContain("no plugin handled nothing:handles-this");
    expect(stdout).toContain("Analysis complete:");
  });

  it("stays silent with `ignore`", SLOW, async () => {
    const dir = fixtureDir("unhandled");
    const { stderr, exitCode } = await runCli(dir, [
      "run",
      "--unhandled-urls",
      "ignore",
    ]);

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");
  });
});

describe("gitignore handling", () => {
  const scaffold = async (gitignore: boolean) => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-e2e-git-"));
    await fs.writeFile(
      path.join(dir, "todone.config.ts"),
      `export default {
        gitignore: ${gitignore},
        globs: ["input/**"],
        plugins: [
          {
            name: "fixture-plugin",
            async checkMatch({ url }: { url: URL }) {
              if (url.protocol !== "fixture:") return null;
              return { title: url.pathname, isExpired: false };
            },
          },
        ],
      };\n`,
    );
    await fs.writeFile(path.join(dir, ".gitignore"), "input/ignored.txt\n");
    await fs.mkdir(path.join(dir, "input"));
    await fs.writeFile(
      path.join(dir, "input", "kept.txt"),
      "@TODO fixture:kept\n",
    );
    await fs.writeFile(
      path.join(dir, "input", "ignored.txt"),
      "@TODO fixture:ignored\n",
    );
    return dir;
  };

  it("skips gitignored files by default", SLOW, async () => {
    const dir = await scaffold(true);
    try {
      const { stdout, exitCode } = await runCli(dir, ["run", "--json"]);

      expect(exitCode).toBe(0);
      expect(stdout).toContain("fixture:kept");
      expect(stdout).not.toContain("fixture:ignored");
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it("scans gitignored files when gitignore is disabled", SLOW, async () => {
    const dir = await scaffold(false);
    try {
      const { stdout, exitCode } = await runCli(dir, ["run", "--json"]);

      expect(exitCode).toBe(0);
      expect(stdout).toContain("fixture:kept");
      expect(stdout).toContain("fixture:ignored");
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
