import type { default as File } from "vinyl";
import { PluginResult } from "./plugins";

export { File };

export interface Offset {
  line: number;
  column: number;
}

export interface Match {
  file: File;
  start: Offset;
  end: Offset;
  url: URL;
}

export interface Result {
  match: Match;
  result: PluginResult;
}

export const getFileId = (file: File) => file.relative;
export const getMatchId = (match: Match) =>
  `${getFileId(match.file)}:${match.start.line}:${match.start.column}`;
