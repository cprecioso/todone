import * as core from "@actions/core";
import * as mdast from "mdast";
import assert from "node:assert/strict";
import * as z from "zod";
import * as md from "../markdown";
import { createComment, createZone, findZone, getComment } from "../markdown";

const sameInputAndOutput = <T, S extends z.ZodType<T, T>>(schema: S) => schema;

const issueDataSchema = sameInputAndOutput(
  z.strictObject({
    todoUrl: z.url(),
  }),
);
export type IssueData = z.infer<typeof issueDataSchema>;

const zoneId = "todone";

export const createIssueData = (data: z.input<typeof issueDataSchema>) =>
  createZone(zoneId, [createComment(JSON.stringify(data))]);

export const findIssueData = (tree: mdast.Nodes) => {
  const content = findZone(tree, zoneId);
  assert(content, `No zone found with id "${zoneId}"`);
  assert.equal(
    content.length,
    1,
    `Expected exactly one zone with id "${zoneId}"`,
  );
  const comment = getComment(content[0]);
  const parsed = issueDataSchema.parse(JSON.parse(comment));
  return parsed;
};

export const tryGetIssueData = (input: string): IssueData | undefined => {
  const ast = md.parse(input);
  try {
    return findIssueData(ast);
  } catch (error) {
    core.debug(`Failed to find issue data in the tree:${error}`);
    return undefined;
  }
};
