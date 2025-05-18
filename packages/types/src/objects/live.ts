import type { BaseMatch, BaseResult } from "./base";

export interface File {
  url: URL;
  getContent: () => ReadableStream<Uint8Array>;
  isPresent: boolean;
}

export interface Match extends BaseMatch<File> {
  url: URL;
}

export interface Result extends BaseResult<Match> {
  url: URL;
}
