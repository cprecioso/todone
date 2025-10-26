import * as core from "@actions/core";
import * as Effect from "effect/Effect";
import * as pkg from "../../package.json" with { type: "json" };

export class Console extends Effect.Service<Console>()(`${pkg.name}/Console`, {
  succeed: {
    info: (message: string) => Effect.sync(() => core.info(message)),
    debug: (message: string) => Effect.sync(() => core.debug(message)),
  },
}) {}
