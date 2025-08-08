import { AnalysisItem } from "@todone/core";
import { GitHubFile } from "./files";

export const partition = <T>(
  input: Iterable<T>,
  predicate: (item: T) => boolean,
) => {
  const trues: T[] = [];
  const falses: T[] = [];

  for (const item of input) {
    if (predicate(item)) trues.push(item);
    else falses.push(item as any);
  }

  return { trues, falses };
};

export type Result = AnalysisItem<GitHubFile> & {
  type: "result";
};

export const isResult = (item: AnalysisItem<GitHubFile>): item is Result =>
  item.type === "result";

export type ExpiredResult = Result & {
  result: { result: { isExpired: true } };
};

export const isExpiredResult = (
  item: AnalysisItem<GitHubFile>,
): item is ExpiredResult =>
  Boolean(isResult(item) && item.result.result?.isExpired);

export const formatDate = (date: Date) =>
  date.toISOString().replace(/T.*$/, "");
