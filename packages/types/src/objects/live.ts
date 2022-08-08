import type File from "vinyl";
import type { BaseMatch, BaseResult } from "./base";

export type { File };
export interface Match extends BaseMatch<File> {}
export interface Result extends BaseResult<Match> {}
