import type { Match } from "todone/types";
import { describe, expect, it } from "vitest";
import type { GitHubContext } from "../context";
import { generateIssue } from "./generator";
import { getIssueData } from "./issue-data";

const fullContext: GitHubContext = {
  server: "https://github.com",
  repository: { owner: "octo", repo: "repo" },
  sha: "abc123",
};

// `repository`/`sha` are runtime-optional (env-derived) despite the
// non-optional static type, so cast to exercise the no-context path.
const bareContext = {
  server: "https://github.com",
  repository: undefined,
  sha: undefined,
} as unknown as GitHubContext;

const matchAt = (localPath: string, line: number, column: number): Match => ({
  url: new URL("https://github.com/octo/repo/issues/5"),
  file: { localPath, fullPath: `/repo/${localPath}` },
  position: { line, column },
});

describe("generateIssue", () => {
  it("renders a full issue with permalinks and an embedded data zone", () => {
    const issue = generateIssue(fullContext, {
      url: new URL("https://github.com/octo/repo/issues/5"),
      result: {
        title: "Fix the flux capacitor",
        isExpired: true,
        expirationDate: new Date("2020-05-06T00:00:00Z"),
      },
      matches: [matchAt("src/main.ts", 3, 7), matchAt("src/other.ts", 10, 1)],
    });

    // GitHub URLs keep the raw URL as the link text.
    expect(issue.title).toBe("TODO: Fix the flux capacitor");
    expect(issue.todoUrl).toBe("https://github.com/octo/repo/issues/5");
    expect(issue.body).toMatchSnapshot();

    // The generated body must be parseable by the reconciler.
    expect(getIssueData(issue.body)).toEqual({
      todoUrl: "https://github.com/octo/repo/issues/5",
    });
  });

  it("falls back to plain locations and titles without repo context", () => {
    const issue = generateIssue(bareContext, {
      url: new URL("date:2020-01-01"),
      result: { title: "A date passed", isExpired: true },
      matches: [matchAt("notes.md", 1, 1)],
    });

    expect(issue.body).toMatchSnapshot();
    expect(issue.body).toContain("notes.md:1:1");
    // External URLs use the result title as the link text.
    expect(issue.body).toContain("[A date passed](date:2020-01-01)");
  });
});
