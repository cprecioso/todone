import type { BaseMatch, BaseResult } from "./base";
import type { File, Match, Result } from "./live";

export interface ReportFile {
  url: string;
  isPresent: boolean;
}
export interface ReportMatch extends BaseMatch<ReportFile> {}
export interface ReportResult extends BaseResult<ReportMatch> {}

export interface Report {
  files: ReportFile[];
  matches: ReportMatch[];
  results: ReportResult[];
}

export const transformFile = ({ url, isPresent }: File): ReportFile => ({
  url: url.href,
  isPresent,
});

export const transformMatch = (match: Match): ReportMatch => ({
  ...match,
  file: transformFile(match.file),
});

export const transformResult = (result: Result): ReportResult => ({
  ...result,
  match: transformMatch(result.match),
});
