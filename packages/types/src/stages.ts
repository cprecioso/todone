import type { File, Match, Result } from "./objects";

export type FileSource = () => AsyncIterable<File>;
export type FileAnalyzer = (file: File) => AsyncIterable<Match>;
export type PluginRunner = (match: Match) => Promise<Result | null>;
export type Reporter = (results: AsyncIterable<Result>) => Promise<void>;
