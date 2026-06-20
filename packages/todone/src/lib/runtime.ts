import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as Effect from "effect/Effect";
import { compose } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";

const NodeRuntimeLayer = Layer.mergeAll(
  NodeHttpClient.layer,
  NodeContext.layer,
);

export const provideRuntime = compose(
  Effect.provide(NodeRuntimeLayer),
  Effect.scoped,
);

export type RuntimeContext =
  | Layer.Layer.Success<typeof NodeRuntimeLayer>
  | Scope.Scope;
