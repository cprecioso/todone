import type { Plugin } from "todone/plugin";
import { beforeEach, describe, expect, it, vi } from "vitest";
import githubPlugin from "./index";

const names = (plugins: ReturnType<typeof githubPlugin>) =>
  (plugins as readonly Plugin[]).map((plugin) => plugin.name);

let emitWarning: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  emitWarning = vi.spyOn(process, "emitWarning").mockImplementation(() => {});
});

describe("githubPlugin factory", () => {
  it("warns when no token is available but stays usable", () => {
    const plugins = githubPlugin();

    expect(emitWarning).toHaveBeenCalledOnce();
    expect(emitWarning.mock.calls[0]![1]).toMatchObject({
      code: "TODONE_GITHUB_NO_TOKEN",
    });
    expect(names(plugins)).toEqual(["@todone/plugin-github:checker"]);
  });

  it("does not warn when a token is provided", () => {
    githubPlugin({ token: "test-token" });

    expect(emitWarning).not.toHaveBeenCalled();
  });

  it("adds the Actions logger when enabled", () => {
    const plugins = githubPlugin({
      token: "test-token",
      actions: { logger: true, summary: false },
    });

    expect(names(plugins)).toEqual([
      "@todone/plugin-github:checker",
      "@todone/plugin-github:logger",
    ]);
  });

  it("adds the reporter when the summary is enabled", () => {
    const plugins = githubPlugin({
      token: "test-token",
      actions: { logger: false, summary: true },
    });

    expect(names(plugins)).toEqual([
      "@todone/plugin-github:checker",
      "@todone/plugin-github:reporter",
    ]);
  });

  it("requires a token to sync issues", () => {
    expect(() => githubPlugin({ createIssues: true })).toThrow(
      /A GitHub token is required to sync issues/,
    );
  });

  it("adds the reporter for issue syncing", () => {
    const plugins = githubPlugin({
      token: "test-token",
      createIssues: true,
      actions: { logger: false, summary: false },
    });

    expect(names(plugins)).toEqual([
      "@todone/plugin-github:checker",
      "@todone/plugin-github:reporter",
    ]);
  });
});
