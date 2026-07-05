import * as mdast from "mdast";
import assert from "node:assert/strict";
import * as z from "zod";
import * as md from "../util/markdown";
import {
  createComment,
  createZone,
  findZone,
  getComment,
} from "../util/markdown";

const zoneId = "todone";

const IssueData = z.object({
  todoUrl: z.string(),
});

export type IssueData = z.infer<typeof IssueData>;

export const createIssueData = (data: IssueData) =>
  createZone(zoneId, [createComment(JSON.stringify(data))]);

/** Throws if the tree does not contain a well-formed data zone. */
export const findIssueData = (tree: mdast.Nodes): IssueData => {
  const content = findZone(tree, zoneId);
  assert(content, `No zone found with id "${zoneId}"`);
  assert.equal(
    content.length,
    1,
    `Expected exactly one zone with id "${zoneId}"`,
  );
  const comment = getComment(content[0]);
  return IssueData.parse(JSON.parse(comment));
};

export const getIssueData = (input: string) => findIssueData(md.parse(input));
