import type { default as File } from "vinyl";
import { PluginResult } from "./plugins";

export { File };

export interface Offset {
  line: number;
  column: number;
}

export interface Match {
  file: string;
  start?: Offset;
  end?: Offset;
  url: URL;
}

export interface Result {
  match: Match;
  result: PluginResult;
}
