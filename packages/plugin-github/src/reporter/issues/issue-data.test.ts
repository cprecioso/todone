import { u } from "unist-builder";
import { describe, expect, it } from "vitest";
import * as md from "../util/markdown";
import { createIssueData, getIssueData } from "./issue-data";

describe("issue data zone", () => {
  it("round-trips through markdown", () => {
    const body = md.stringify(
      u("root", [
        u("paragraph", [u("text", "Some issue body")]),
        ...createIssueData({ todoUrl: "https://example.com/x" }),
      ]),
    );

    expect(getIssueData(body)).toEqual({ todoUrl: "https://example.com/x" });
  });

  it("throws when the body has no data zone", () => {
    expect(() => getIssueData("Just a regular issue body")).toThrow(
      /No zone found/,
    );
  });

  it("throws when the zone contains more than one node", () => {
    const body = md.stringify(
      u("root", [
        ...md.createZone("todone", [
          md.createComment("{}"),
          md.createComment("{}"),
        ]),
      ]),
    );

    expect(() => getIssueData(body)).toThrow(/exactly one node/);
  });

  it("throws when the zone payload is not valid JSON", () => {
    const body = md.stringify(
      u("root", [...md.createZone("todone", [md.createComment("not json")])]),
    );

    expect(() => getIssueData(body)).toThrow(/JSON/);
  });

  it("throws when the payload is missing the todoUrl", () => {
    const body = md.stringify(
      u("root", [...md.createZone("todone", [md.createComment("{}")])]),
    );

    expect(() => getIssueData(body)).toThrow(/todoUrl/);
  });
});
