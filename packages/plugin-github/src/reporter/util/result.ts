import { CheckerResult } from "todone/plugin";
import * as t from "todone/types";

/**
 * A TODO URL with every location it was found at. The core emits one
 * {@link t.Result} per match; the issue reporter needs them regrouped by URL
 * (one issue per TODO URL, listing all its locations).
 */
export interface GroupedResult {
  url: URL;
  result: CheckerResult | null;
  matches: t.Match[];
}

export const groupResults = (results: readonly t.Result[]): GroupedResult[] => {
  const byUrl = new Map<string, GroupedResult>();

  for (const { url, result, match } of results) {
    const key = url.toString();
    const existing = byUrl.get(key);
    if (existing) {
      existing.matches.push(match);
      existing.result ??= result;
    } else {
      byUrl.set(key, { url, result, matches: [match] });
    }
  }

  return [...byUrl.values()];
};

export interface ExpiredResult extends GroupedResult {
  result: CheckerResult;
}

export const isExpiredResult = (
  result: GroupedResult,
): result is ExpiredResult => result.result?.isExpired ?? false;
