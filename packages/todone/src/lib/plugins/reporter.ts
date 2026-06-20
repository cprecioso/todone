import * as t from "#/types";
import * as Effect from "effect/Effect";
import { PluginBase } from "./base";

export interface Reporter extends PluginBase {
  info: (message: string) => Effect.Effect<void, unknown>;
  debug: (message: string) => Effect.Effect<void, unknown>;

  reportFile: (item: t.File) => Effect.Effect<void, unknown>;
  reportMatch: (item: t.Match) => Effect.Effect<void, unknown>;
  reportResult: (item: t.Result) => Effect.Effect<void, unknown>;
}
