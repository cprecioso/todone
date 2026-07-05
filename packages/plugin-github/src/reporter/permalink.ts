import * as t from "todone/types";
import { ActionContext } from "./context";

/**
 * Builds a permalink to a file (optionally at a line) on GitHub, using the
 * commit SHA from the Action context. Returns `undefined` when the context
 * lacks a repo or SHA, so callers can fall back to a plain location.
 */
export const filePermalink = (
  context: ActionContext,
  file: t.File,
  line?: number,
): string | undefined => {
  if (!context.repo || !context.sha) return undefined;

  const { owner, repo } = context.repo;
  const lineSuffix = line ? `#L${line}` : "";

  return `${context.serverUrl}/${owner}/${repo}/blob/${context.sha}/${file.localPath}${lineSuffix}`;
};
