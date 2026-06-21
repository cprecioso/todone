import { Factory, Reporter } from "#/plugin";
import * as Path from "@effect/platform/Path";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import { flow } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { BUILTIN_PLUGIN_ID } from "./base";

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

export const jsonReporter: Factory<Reporter> = {
  id: `${BUILTIN_PLUGIN_ID}/json`,
  create: () =>
    Effect.gen(function* () {
      const outputItem = flow(
        Schema.encode(OutputItem),
        Effect.map(JSON.stringify),
        Effect.flatMap(Console.log),
        Effect.provideService(Path.Path, yield* Path.Path),
      );

      const plugin: Reporter = {
        info: (message: string) => Console.info(message),
        debug: (message: string) => Console.debug(message),

        reportFile: (file) =>
          outputItem({ type: "file", location: file.localPath }),

        reportMatch: ({ url, file, position }) =>
          outputItem({
            type: "match",
            url,
            location: file.localPath,
            ...position,
          }),

        reportResult: ({ url, result }) =>
          Option.match(result, {
            onSome: (result) => outputItem({ type: "result", url, ...result }),
            onNone: () => Effect.void,
          }),
      };

      return plugin;
    }),
};
