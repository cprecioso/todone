import { describe, expect, it } from "vitest";
import type { GitHubContext } from "./context";
import { filePermalink } from "./permalink";

const context: GitHubContext = {
  server: "https://github.com",
  repository: { owner: "octo", repo: "repo" },
  sha: "abc123",
};

const file = { localPath: "src/main.ts", fullPath: "/repo/src/main.ts" };

describe("filePermalink", () => {
  it("builds a blob permalink pinned to the commit SHA", () => {
    expect(filePermalink(context, file, 42)).toBe(
      "https://github.com/octo/repo/blob/abc123/src%2Fmain.ts#L42",
    );
  });

  it("omits the line suffix without a line", () => {
    expect(filePermalink(context, file)).toBe(
      "https://github.com/octo/repo/blob/abc123/src%2Fmain.ts",
    );
  });

  it("returns undefined without a repository or SHA", () => {
    // `repository`/`sha` are runtime-optional (env-derived) despite the
    // non-optional static type, so cast to exercise the guard.
    expect(
      filePermalink(
        { ...context, repository: undefined } as unknown as GitHubContext,
        file,
        1,
      ),
    ).toBeUndefined();
    expect(
      filePermalink(
        { ...context, sha: undefined } as unknown as GitHubContext,
        file,
        1,
      ),
    ).toBeUndefined();
  });
});
