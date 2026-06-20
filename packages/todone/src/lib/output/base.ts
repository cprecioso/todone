import * as t from "@todone/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as pkg from "../../../package.json" with { type: "json" };
import { LocalFile } from "../get-files";

export class OutputMode extends Context.Tag(`${pkg.name}/OutputMode`)<
  OutputMode,
  {
    fileItem: (item: LocalFile) => Effect.Effect<void, unknown>;
    matchItem: (item: t.Match) => Effect.Effect<void, unknown>;
    resultItem: (item: t.Result) => Effect.Effect<void, unknown>;
  }
>() {}
