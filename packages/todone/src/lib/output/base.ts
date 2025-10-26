import * as t from "@todone/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as pkg from "../../../package.json" with { type: "json" };
import { LocalFile } from "../get-files";

export class OutputMode extends Context.Tag(`${pkg.name}/OutputMode`)<
  OutputMode,
  {
    start: Effect.Effect<void>;

    fileItem: (item: LocalFile) => Effect.Effect<void, unknown>;
    matchItem: (
      item: t.Match<LocalFile.E, LocalFile.R, LocalFile>,
    ) => Effect.Effect<void, unknown>;
    resultItem: (
      item: t.Result<LocalFile.E, LocalFile.R, LocalFile>,
    ) => Effect.Effect<void, unknown>;

    end: Effect.Effect<void>;
  }
>() {}
