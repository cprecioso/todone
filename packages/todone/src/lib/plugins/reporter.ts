import * as t from "#/types";

export interface Reporter extends AsyncDisposable {
  info: (message: string) => Promise<void>;
  debug: (message: string) => Promise<void>;

  reportFile: (item: t.File) => Promise<void>;
  reportMatch: (item: t.Match) => Promise<void>;
  reportResult: (item: t.Result) => Promise<void>;
}
