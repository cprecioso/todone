import { Plugin, PluginFactory } from "@todone/types";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
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

export default Layer.effect(
  Plugin,
  Effect.gen(function* () {
    const api = yield* Figma;

    return {
      name: "Figma",

      pattern,

      check: ({ url }) =>
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
    };
  }),
).pipe(Layer.provide(Figma.Default)) satisfies PluginFactory<unknown>;
