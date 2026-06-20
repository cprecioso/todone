import { provideRuntime, RuntimeContext } from "#/lib/runtime";
import { Command } from "clipanion";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";

export abstract class EffectComand extends Command {
  abstract effect: () => Promise<
    Effect.Effect<void | number, unknown, RuntimeContext>
  >;

  async execute() {
    return await pipe(
      Effect.tryPromise(this.effect),
      Effect.flatten,
      provideRuntime,
      Effect.runPromise,
    );
  }
}
