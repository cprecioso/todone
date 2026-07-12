import * as t from "#/types";

export type ReporterFn = () => Promise<Reporter>;

export interface Reporter extends AsyncDisposable {
  warn: (message: string) => Promise<void>;
  info: (message: string) => Promise<void>;
  debug: (message: string) => Promise<void>;

  reportFile: (item: t.File) => Promise<void>;
  reportMatch: (item: t.Match) => Promise<void>;
  reportResult: (item: t.Result) => Promise<void>;
}
