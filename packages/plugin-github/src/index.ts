import { Plugin, PluginFactory } from "@todone/types";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
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

export default Layer.effect(
  Plugin,
  Effect.gen(function* () {
    const gh = yield* GitHub;

    return {
      name: "GitHub",

      pattern,

      check: ({ url }) =>
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
    };
  }),
).pipe(Layer.provide(GitHub.Default)) satisfies PluginFactory<unknown>;
