import * as NodeContext from "@effect/platform-node/NodeContext";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import { Command } from "clipanion";
import * as Effect from "effect/Effect";

export abstract class EffectComand extends Command {
  abstract effect: Effect.Effect<
    void | number,
    unknown,
    NodeContext.NodeContext | HttpClient.HttpClient
  >;

  async execute() {
    return await this.effect.pipe(
      Effect.provide(FetchHttpClient.layer),
      Effect.provide(NodeContext.layer),
      Effect.runPromise,
    );
  }
}
