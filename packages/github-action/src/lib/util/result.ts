import * as t from "@todone/types";
import { GitHubFile } from "../files";

export type Result = t.Result<GitHubFile.E, GitHubFile.R, GitHubFile>;
export type ExpiredResult = Result & { result: { isExpired: true } };

export const isExpiredResult = (result: Result): result is ExpiredResult =>
  Boolean(result.result?.isExpired);
