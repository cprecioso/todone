import type { Octokit } from "octokit";
import { describe, expect, it, vi } from "vitest";
import { makeCheckerPlugin } from "./checker";

const makeFakeClient = () => ({
  rest: {
    issues: {
      get: vi.fn(async () => ({
        data: { title: "An issue", state: "open", closed_at: null },
      })),
      getMilestone: vi.fn(async () => ({
        data: {
          title: "A milestone",
          state: "open",
          closed_at: null,
          due_on: null,
        },
      })),
    },
    pulls: {
      get: vi.fn(async () => ({
        data: { title: "A pull request", state: "open", closed_at: null },
      })),
    },
  },
});

const context = () => ({ warn: vi.fn(), info: vi.fn(), debug: vi.fn() });

const check = (client: ReturnType<typeof makeFakeClient>, url: string) =>
  makeCheckerPlugin(client as unknown as Octokit).checkMatch!.call(context(), {
    url: new URL(url),
  });

describe("checker URL dispatch", () => {
  it("fetches issues with a coerced issue number", async () => {
    const client = makeFakeClient();

    await expect(
      check(client, "https://github.com/octo/repo/issues/123"),
    ).resolves.toMatchObject({ title: "An issue", isExpired: false });

    expect(client.rest.issues.get).toHaveBeenCalledExactlyOnceWith({
      owner: "octo",
      repo: "repo",
      issue_number: 123,
    });
  });

  it("fetches pull requests", async () => {
    const client = makeFakeClient();

    await expect(
      check(client, "https://github.com/octo/repo/pull/7"),
    ).resolves.toMatchObject({ title: "A pull request" });

    expect(client.rest.pulls.get).toHaveBeenCalledExactlyOnceWith({
      owner: "octo",
      repo: "repo",
      pull_number: 7,
    });
  });

  it("fetches milestones", async () => {
    const client = makeFakeClient();

    await expect(
      check(client, "https://github.com/octo/repo/milestone/3"),
    ).resolves.toMatchObject({ title: "A milestone" });

    expect(client.rest.issues.getMilestone).toHaveBeenCalledExactlyOnceWith({
      owner: "octo",
      repo: "repo",
      milestone_number: 3,
    });
  });

  it("accepts www and http variants", async () => {
    const client = makeFakeClient();

    await expect(
      check(client, "http://www.github.com/octo/repo/issues/1"),
    ).resolves.not.toBeNull();
  });
});

describe("checker URL rejection", () => {
  it.each([
    ["other hosts", "https://sgithub.com/octo/repo/issues/1"],
    ["unknown resource kinds", "https://github.com/octo/repo/discussions/1"],
    ["the plural pulls path", "https://github.com/octo/repo/pulls/1"],
    ["deeper paths", "https://github.com/octo/repo/issues/1/comments"],
    ["repo home pages", "https://github.com/octo/repo"],
  ])("declines %s", async (_label, url) => {
    const client = makeFakeClient();

    await expect(check(client, url)).resolves.toBeNull();
    expect(client.rest.issues.get).not.toHaveBeenCalled();
    expect(client.rest.pulls.get).not.toHaveBeenCalled();
  });

  it("throws on a non-numeric resource number", async () => {
    const client = makeFakeClient();

    await expect(
      check(client, "https://github.com/octo/repo/issues/abc"),
    ).rejects.toThrow();
  });
});
