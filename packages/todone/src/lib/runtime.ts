import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttpClient from "@effect/platform-node/NodeHttpClient";
import * as Layer from "effect/Layer";

export const NodeRuntimeLayer = NodeHttpClient.layer.pipe(
  Layer.provideMerge(NodeContext.layer),
);

export type NodeRuntimeContext = Layer.Layer.Success<typeof NodeRuntimeLayer>;
