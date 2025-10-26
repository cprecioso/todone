import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as mdast from "mdast";
import assert from "node:assert/strict";
import * as md from "../util/markdown";
import {
  createComment,
  createZone,
  findZone,
  getComment,
} from "../util/markdown";

const zoneId = "todone";

const IssueData = Schema.parseJson(
  Schema.Struct({
    todoUrl: Schema.String,
  }),
);

export type IssueData = Schema.Schema.Type<typeof IssueData>;

const encodeCommentDataSync = Schema.encodeSync(IssueData);
const parseCommentData = Schema.decode(IssueData);

export const createIssueData = (data: IssueData) =>
  createZone(zoneId, [createComment(encodeCommentDataSync(data))]);

export const findIssueData = (tree: mdast.Nodes) =>
  Effect.gen(function* () {
    const content = findZone(tree, zoneId);
    assert(content, `No zone found with id "${zoneId}"`);
    assert.equal(
      content.length,
      1,
      `Expected exactly one zone with id "${zoneId}"`,
    );
    const comment = getComment(content[0]);
    const parsed = yield* parseCommentData(comment);
    return parsed;
  });

export const getIssueData = (input: string) =>
  Effect.gen(function* () {
    const ast = md.parse(input);
    try {
      return yield* findIssueData(ast);
    } catch (error) {
      core.debug(`Failed to find issue data in the tree:${error}`);
      throw error;
    }
  });
