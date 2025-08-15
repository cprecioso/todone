import { RunnerMatch } from "@todone/core";
import { Result } from "@todone/types";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as pkg from "../../../package.json" with { type: "json" };
import { LocalFile } from "../get-files";

export class OutputMode extends Context.Tag(`${pkg.name}/OutputMode`)<
  OutputMode,
  {
    start: Effect.Effect<void>;

    fileItem: (item: LocalFile) => Effect.Effect<void, unknown>;
    matchItem: (item: RunnerMatch<LocalFile>) => Effect.Effect<void, unknown>;
    resultItem: (item: Result<LocalFile>) => Effect.Effect<void, unknown>;

    end: Effect.Effect<void>;
  }
>() {}
