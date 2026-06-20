import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { flow, pipe, satisfies } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { Checker, PluginFactory } from "todone/plugin";
import { Figma } from "./api";
const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?figma.com",
  pathname: "/file/:fileID",
  hash: "#:commentID",
});

const matchPattern = (url: URL) =>
  Effect.andThen(
    Effect.sync(() => pattern.exec(url)),
    Schema.decodeUnknown(
      Schema.Struct({
        pathname: Schema.Struct({
          groups: Schema.Struct({
            fileID: Schema.String,
          }),
        }),
        hash: Schema.Struct({
          groups: Schema.Struct({
            commentID: Schema.String,
          }),
        }),
      }),
    ),
  );

export class CommentNotFoundError extends Data.Error<{}> {}

const checker = Effect.map(
  Figma,
  (api): Checker => ({
    name: "Figma Comment Checker",
    checkMatch: flow(
      Option.liftPredicate(({ url }) => pattern.test(url)),
      Option.map(({ url }) =>
        Effect.gen(function* () {
          const {
            pathname: {
              groups: { fileID },
            },
            hash: {
              groups: { commentID },
            },
          } = yield* matchPattern(url);

          const { comments } = yield* api.Files.GetComments({
            path: { fileID: fileID },
          });
          if (!comments) return yield* new CommentNotFoundError();

          const comment = comments.find((comment) => comment.id === commentID);
          if (!comment) return yield* new CommentNotFoundError();

          const closeDate = comment.resolved_at;
          const isExpired = Boolean(closeDate);

          return {
            title: `Figma comment from ${comment.user.handle}`,
            isExpired,
            expirationDate: closeDate || undefined,
          };
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
  Effect.provide(Figma.Default),
  satisfies<PluginFactory>(),
);
