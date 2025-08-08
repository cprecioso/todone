import { AnalysisItem } from "@todone/core";
import { GitHubFile } from "./files";

export const partition = <T, U extends T>(
  input: Iterable<T>,
  predicate: (item: T) => item is U,
) => {
  const trues: U[] = [];
  const falses: Exclude<T, U>[] = [];

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
