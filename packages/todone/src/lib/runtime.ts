import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const NodeRuntimeLayer = Layer.mergeAll(
  NodeHttpClient.layer,
  NodeContext.layer,
);

export const provideRuntime = Effect.provide(NodeRuntimeLayer);

export type RuntimeContext = Layer.Layer.Success<typeof NodeRuntimeLayer>;
