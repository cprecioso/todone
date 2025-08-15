import * as Path from "@effect/platform/Path";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { OutputMode } from "./base";

const URLFromString = Schema.transform(Schema.String, Schema.instanceOf(URL), {
  strict: true,
  decode: (str) => new URL(str),
  encode: (url) => url.toString(),
});

const AbsolutePath = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.filterEffect((str) =>
    Effect.gen(function* () {
      const path = yield* Path.Path;
      return path.isAbsolute(str);
    }),
  ),
);

const FileItem = Schema.Struct({
  type: Schema.Literal("file"),
  location: AbsolutePath,
});

const MatchItem = Schema.Struct({
  type: Schema.Literal("match"),
  url: URLFromString,
  location: AbsolutePath,
  line: Schema.NonNegativeInt,
  column: Schema.NonNegativeInt,
});

const ResultItem = Schema.Struct({
  type: Schema.Literal("result"),
  url: URLFromString,
  title: Schema.String,
  isExpired: Schema.Boolean,
  expirationDate: Schema.optional(Schema.Date),
});

export const OutputItem = Schema.Union(FileItem, MatchItem, ResultItem);

export const OutputJson = Layer.effect(
  OutputMode,
  Effect.gen(function* () {
    const outputItem = flow(
      Schema.encode(OutputItem),
      Effect.map(JSON.stringify),
      Effect.flatMap(Console.log),
      Effect.provideService(Path.Path, yield* Path.Path),
    );

    return {
      start: Effect.void,

      fileItem: (file) => outputItem({ type: "file", location: file.fullPath }),

      matchItem: ({ url, match }) =>
        outputItem({
          type: "match",
          url,
          location: match.file.fullPath,
          ...match.position,
        }),

      resultItem: ({ url, result }) =>
        result ? outputItem({ type: "result", url, ...result }) : Effect.void,

      end: Effect.void,
    };
  }),
);
