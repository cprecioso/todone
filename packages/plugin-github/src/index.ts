import * as Effect from "effect/Effect";
import { flow, pipe } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { Checker, Factory, PluginFactory } from "todone/plugin";
import * as pkg from "../package.json" with { type: "json" };
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

const checker: Factory<Checker> = {
  id: `${pkg.name}/issues`,

  create: () =>
    pipe(
      GitHub,
      Effect.map(
        (gh): Checker => ({
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
      ),
      Effect.provide(GitHub.Default),
    ),
};

const plugin: PluginFactory = {
  id: pkg.name,
  create: () => Effect.succeed({ checkers: [checker] }),
};

export default plugin;
