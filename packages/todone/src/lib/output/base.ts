import * as t from "#/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as pkg from "../../../package.json" with { type: "json" };

export class OutputMode extends Context.Tag(`${pkg.name}/OutputMode`)<
  OutputMode,
  {
    fileItem: (item: t.File) => Effect.Effect<void, unknown>;
    matchItem: (item: t.Match) => Effect.Effect<void, unknown>;
    resultItem: (item: t.Result) => Effect.Effect<void, unknown>;
  }
>() {}
