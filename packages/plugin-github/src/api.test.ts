import type { Octokit } from "octokit";
import { describe, expect, it, vi } from "vitest";
import { makeResourceFetchers } from "./api";

const repo = { owner: "octo", repo: "repo" };

const clientWith = (overrides: {
  issue?: unknown;
  pull?: unknown;
  milestone?: unknown;
}) =>
  ({
    rest: {
      issues: {
        get: vi.fn(async () => ({ data: overrides.issue })),
        getMilestone: vi.fn(async () => ({ data: overrides.milestone })),
      },
      pulls: { get: vi.fn(async () => ({ data: overrides.pull })) },
    },
  }) as unknown as Octokit;

describe("resource fetchers", () => {
  it("maps a closed issue to an expired result with its close date", async () => {
    const fetchers = makeResourceFetchers(
      clientWith({
        issue: {
          title: "Done issue",
          state: "closed",
          closed_at: "2020-01-02T03:04:05Z",
        },
      }),
    );

    await expect(fetchers.issues(repo, 1)).resolves.toEqual({
      title: "Done issue",
      isExpired: true,
      expirationDate: new Date("2020-01-02T03:04:05Z"),
    });
  });

  it("maps an open pull request to an unexpired, dateless result", async () => {
    const fetchers = makeResourceFetchers(
      clientWith({
        pull: { title: "Open PR", state: "open", closed_at: null },
      }),
    );

    await expect(fetchers.pull(repo, 2)).resolves.toEqual({
      title: "Open PR",
      isExpired: false,
      expirationDate: undefined,
    });
  });

  it("falls back to the milestone due date when it is not closed", async () => {
    const fetchers = makeResourceFetchers(
      clientWith({
        milestone: {
          title: "v2",
          state: "open",
          closed_at: null,
          due_on: "2030-06-01T00:00:00Z",
        },
      }),
    );

    await expect(fetchers.milestone(repo, 3)).resolves.toEqual({
      title: "v2",
      isExpired: false,
      expirationDate: new Date("2030-06-01T00:00:00Z"),
    });
  });

  it("prefers the milestone close date over the due date", async () => {
    const fetchers = makeResourceFetchers(
      clientWith({
        milestone: {
          title: "v1",
          state: "closed",
          closed_at: "2020-01-01T00:00:00Z",
          due_on: "2030-06-01T00:00:00Z",
        },
      }),
    );

    await expect(fetchers.milestone(repo, 4)).resolves.toEqual({
      title: "v1",
      isExpired: true,
      expirationDate: new Date("2020-01-01T00:00:00Z"),
    });
  });
});
