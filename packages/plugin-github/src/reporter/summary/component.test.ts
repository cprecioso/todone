import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterAll, beforeEach, expect, it, vi } from "vitest";
import type { GitHubContext } from "../context";
import { writeSummary } from "./component";

// The real @actions/core summary writer is used; it appends to the file that
// GITHUB_STEP_SUMMARY points at (test/setup.ts guarantees the real variable
// never leaks in). The summary singleton caches the file path on first use,
// so every test in this file must reuse the same path.
const dir = await fs.mkdtemp(path.join(os.tmpdir(), "todone-summary-"));
const summaryFile = path.join(dir, "summary.html");
beforeEach(async () => {
  await fs.writeFile(summaryFile, "");
  vi.stubEnv("GITHUB_STEP_SUMMARY", summaryFile);
});
afterAll(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

it("writes a job summary table with every column kind", async () => {
  const context = {
    server: "https://github.com",
    repository: { owner: "octo", repo: "repo" },
    sha: "abc123",
  };

  await writeSummary(context, {
    heading: "TODOs found",
    columns: ["file", "url", "expired", "expirationDate", "issue", "action"],
    rows: [
      {
        match: {
          url: new URL("test:expired"),
          file: { localPath: "src/main.ts", fullPath: "/repo/src/main.ts" },
          position: { line: 3, column: 7 },
        },
        url: "test:expired",
        result: {
          title: "Expired",
          isExpired: true,
          expirationDate: new Date("2020-05-06T00:00:00Z"),
        },
        issueNumber: 42,
        actionMessage: "Created",
      },
      {
        match: {
          url: new URL("test:fresh"),
          file: { localPath: "src/other.ts", fullPath: "/repo/src/other.ts" },
          position: { line: 1, column: 1 },
        },
        url: "test:fresh",
        result: { title: "Fresh", isExpired: false },
      },
      {
        url: "test:orphaned",
        issueNumber: 7,
        actionMessage: "Closed (completed)",
      },
    ],
  });

  const summary = await fs.readFile(summaryFile, "utf8");
  expect(summary).toMatchSnapshot();

  // Spot-check the interesting cells.
  expect(summary).toContain("❗");
  expect(summary).toContain("⌛");
  expect(summary).toContain("2020-05-06");
  expect(summary).toContain("No expiration date");
  expect(summary).toContain("https://github.com/octo/repo/issues/42");
  expect(summary).toContain("blob/abc123");
});

it("renders plain locations and issue numbers without repo context", async () => {
  // `repository`/`sha` are runtime-optional (env-derived) despite the
  // non-optional static type, so cast to exercise the no-context path.
  const context = {
    server: "https://github.com",
    repository: undefined,
    sha: undefined,
  } as unknown as GitHubContext;

  await writeSummary(context, {
    heading: "TODOs found",
    columns: ["file", "issue"],
    rows: [
      {
        match: {
          url: new URL("test:x"),
          file: { localPath: "src/main.ts", fullPath: "/repo/src/main.ts" },
          position: { line: 3, column: 7 },
        },
        issueNumber: 5,
      },
    ],
  });

  const summary = await fs.readFile(summaryFile, "utf8");
  expect(summary).toContain("src/main.ts");
  expect(summary).not.toContain("<a href");
  expect(summary).toContain("#5");
});
