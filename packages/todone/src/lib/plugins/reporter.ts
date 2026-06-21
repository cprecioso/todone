import * as t from "#/types";
import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";

export interface Reporter {
  info: (message: string) => Effect.Effect<void, unknown, Scope.Scope>;
  debug: (message: string) => Effect.Effect<void, unknown, Scope.Scope>;

  reportFile: (item: t.File) => Effect.Effect<void, unknown, Scope.Scope>;
  reportMatch: (item: t.Match) => Effect.Effect<void, unknown, Scope.Scope>;
  reportResult: (item: t.Result) => Effect.Effect<void, unknown, Scope.Scope>;
}
