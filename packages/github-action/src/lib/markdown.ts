import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import * as t from "mdast";
import { zone } from "mdast-zone";
import assert from "node:assert/strict";
import { u } from "unist-builder";

export const createComment = (text: string): t.Html =>
  u("html", toHtml(u("comment", text)));

export const getComment = (node: t.Nodes) => {
  assert(node.type === "html");
  const hast = fromHtml(node.value, { fragment: true });
  assert(hast.children.length === 1);
  const [child] = hast.children;
  assert(child.type === "comment");
  return child.value;
};

// Follows the convention from `mdast-zone`
export const createZone = <const InNodes extends readonly t.Nodes[]>(
  name: string,
  content: InNodes,
) =>
  [
    createComment(`${name} start`),
    ...content,
    createComment(`${name} end`),
  ] as const;

export const findZone = (tree: t.Nodes, id: string) => {
  let found: t.Nodes[] | undefined;
  zone(tree, id, (start, between, end) => {
    found ??= between;
  });
  return found;
};
