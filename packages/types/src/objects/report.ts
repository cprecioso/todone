import type { BaseMatch, BaseResult } from "./base";
import type { File, Match, Result } from "./live";

export interface ReportFile {
  url: string;
  isPresent: boolean;
}

export interface ReportMatch extends BaseMatch<ReportFile> {
  url: string;
}

export interface ReportResult extends BaseResult<ReportMatch> {
  url: string;
}

export interface Report {
  files: ReportFile[];
  matches: ReportMatch[];
  results: ReportResult[];
}

const enforceStringURL = (url: string | URL): string =>
  url instanceof URL ? url.href : url;

export const transformFile = ({ url, isPresent }: File): ReportFile => ({
  url: enforceStringURL(url),
  isPresent,
});

export const transformMatch = ({ url, ...match }: Match): ReportMatch => ({
  ...match,
  url: enforceStringURL(url),
  file: transformFile(match.file),
});

export const transformResult = ({ url, ...result }: Result): ReportResult => ({
  ...result,
  url: enforceStringURL(url),
  match: transformMatch(result.match),
});
