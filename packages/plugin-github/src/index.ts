import { Checker, PluginFactory } from "@todone/types";
import * as Effect from "effect/Effect";
import { flow, pipe, satisfies } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { GitHub } from "./common";
import { resourceFetchers } from "./fetch";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?github.com",
  pathname: "/:owner/:repo/:resource_kind(issues|pull|milestone)/:number",
});

const matchPattern = (url: URL) =>
  Effect.andThen(
    Effect.sync(() => pattern.exec(url)),
    Schema.decodeUnknown(
      Schema.Struct({
        pathname: Schema.Struct({
          groups: Schema.Struct({
            owner: Schema.String,
            repo: Schema.String,
            resource_kind: Schema.Literal("issues", "pull", "milestone"),
            number: Schema.NumberFromString.pipe(
              Schema.positive(),
              Schema.int(),
            ),
          }),
        }),
      }),
    ),
  );

const checker = Effect.map(
  GitHub,
  (gh): Checker => ({
    name: "GitHub Issues & PRs Checker",
    checkMatch: flow(
      Option.liftPredicate(({ url }) => pattern.test(url)),
      Option.map(({ url }) =>
        Effect.gen(function* () {
          const {
            pathname: {
              groups: { owner, repo, resource_kind, number },
            },
          } = yield* matchPattern(url);

          const fetcher = resourceFetchers[resource_kind](
            { owner, repo },
            number,
          );

          return yield* Effect.provideService(fetcher, GitHub, gh);
        }),
      ),
      Option.match({
        onSome: Effect.map(Option.some),
        onNone: () => Effect.succeed(Option.none()),
      }),
    ),
  }),
);

export default pipe(
  Effect.gen(function* () {
    return {
      checkers: [yield* checker],
    };
  }),
  Effect.provide(GitHub.Default),
  satisfies<PluginFactory<unknown>>(),
);
