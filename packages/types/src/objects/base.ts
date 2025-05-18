import { PluginResult } from "../plugins";

export interface Offset {
  line: number;
  column: number;
}

export interface BaseMatch<FileType> {
  file: FileType;
  start: Offset;
  end: Offset;
  url: URL | string;
}

export interface BaseResult<MatchType extends BaseMatch<any>> {
  match: MatchType;
  result: PluginResult | null;
}
