import type { BaseMatch, BaseResult } from "./base";

export interface File {
  url: URL;
  getContent: () => Promise<ReadableStream>;
  isPresent: boolean;
}
export interface Match extends BaseMatch<File> {}
export interface Result extends BaseResult<Match> {}
