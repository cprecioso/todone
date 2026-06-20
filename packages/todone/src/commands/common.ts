import * as NodeContext from "@effect/platform-node/NodeContext";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import { Command } from "clipanion";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Scope from "effect/Scope";

export abstract class EffectComand extends Command {
  abstract effect: () => Promise<
    Effect.Effect<
      void | number,
      unknown,
      NodeContext.NodeContext | HttpClient.HttpClient | Scope.Scope
    >
  >;

  async execute() {
    return await pipe(
      Effect.tryPromise(this.effect),
      Effect.flatten,
      Effect.scoped,
      Effect.provide(FetchHttpClient.layer),
      Effect.provide(NodeContext.layer),
      Effect.runPromise,
    );
  }
}
