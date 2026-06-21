import * as Option from "effect/Option";
import * as t from "todone/types";
import { ActionContext } from "./context";

/**
 * Builds a permalink to a file (optionally at a line) on GitHub, using the
 * commit SHA from the Action context. Returns {@link Option.none} when the
 * context lacks a repo or SHA, so callers can fall back to a plain location.
 *
 * Replaces the old `GitHubFile.getUrl` which shelled out to `gh browse`.
 */
export const filePermalink = (
  context: ActionContext,
  file: t.File,
  line?: number,
): Option.Option<string> => {
  if (Option.isNone(context.repo) || Option.isNone(context.sha)) {
    return Option.none();
  }

  const { owner, repo } = context.repo.value;
  const sha = context.sha.value;
  const lineSuffix = line ? `#L${line}` : "";

  return Option.some(
    `${context.serverUrl}/${owner}/${repo}/blob/${sha}/${file.localPath}${lineSuffix}`,
  );
};
