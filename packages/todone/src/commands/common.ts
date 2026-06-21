import { provideRuntime, RuntimeContext } from "#/lib/runtime";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { Command } from "clipanion";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Scope from "effect/Scope";

export abstract class EffectComand extends Command {
  abstract effect: () => Promise<
    Effect.Effect<void | number, unknown, RuntimeContext | Scope.Scope>
  >;

  async execute() {
    return pipe(
      Effect.tryPromise(this.effect),
      Effect.flatten,
      provideRuntime,
      Effect.scoped,
      NodeRuntime.runMain(),
    );
  }
}
