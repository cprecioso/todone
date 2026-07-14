import type * as t from "todone/types";
import { u } from "unist-builder";
import { describe, expect, it } from "vitest";
import * as md from "../util/markdown";
import type { GitHubAPI, RemoteIssue } from "./actions";
import { createIssueData } from "./issue-data";
import { reconcile } from "./reconciler";

const issueBodyFor = (todoUrl: string) =>
  md.stringify(u("root", [...createIssueData({ todoUrl })]));

const apiWithIssues = (issues: RemoteIssue[]): GitHubAPI =>
  ({
    fetchCurrentIssues: async function* () {
      yield* issues;
    },
  }) as unknown as GitHubAPI;

const result = (url: string, state: "expired" | "fresh" | null): t.Result => ({
  url: new URL(url),
  matches: [
    {
      url: new URL(url),
      file: { localPath: "a.txt", fullPath: "/a.txt" },
      position: { line: 1, column: 1 },
    },
  ],
  result:
    state === null ? null : { title: url, isExpired: state === "expired" },
});

describe("reconcile", () => {
  it("classifies every result/issue combination", async () => {
    const api = apiWithIssues([
      { number: 1, body: issueBodyFor("test:expired-known") },
      { number: 2, body: "no data zone in here" },
      { number: 3, body: issueBodyFor("test:gone") },
      { number: 4, body: null },
    ]);

    const outcomes = await reconcile(api, [
      result("test:expired-known", "expired"),
      result("test:expired-new", "expired"),
      result("test:fresh", "fresh"),
      result("test:unhandled", null),
    ]);

    expect(outcomes).toEqual([
      expect.objectContaining({
        type: "RemoteMatched",
        url: "test:expired-known",
        issueNumber: 1,
      }),
      expect.objectContaining({ type: "LocalOnly", url: "test:expired-new" }),
      expect.objectContaining({ type: "NotTriggered", url: "test:fresh" }),
      expect.objectContaining({
        type: "NotTriggered",
        url: "test:unhandled",
        result: null,
      }),
      expect.objectContaining({
        type: "Orphaned",
        url: "test:gone",
        issueNumber: 3,
      }),
      expect.objectContaining({ type: "Invalid", issueNumber: 2 }),
      expect.objectContaining({ type: "Invalid", issueNumber: 4 }),
    ]);
  });

  it("keeps an issue alive while its TODO is still expired", async () => {
    const api = apiWithIssues([
      { number: 7, body: issueBodyFor("test:still-here") },
    ]);

    const outcomes = await reconcile(api, [
      result("test:still-here", "expired"),
    ]);

    expect(outcomes).toEqual([
      expect.objectContaining({ type: "RemoteMatched", issueNumber: 7 }),
    ]);
    expect(outcomes.some((o) => o.type === "Orphaned")).toBe(false);
  });

  it("orphans every issue when there are no results at all", async () => {
    const api = apiWithIssues([{ number: 9, body: issueBodyFor("test:gone") }]);

    const outcomes = await reconcile(api, []);

    expect(outcomes).toEqual([
      expect.objectContaining({
        type: "Orphaned",
        url: "test:gone",
        issueNumber: 9,
      }),
    ]);
  });
});
