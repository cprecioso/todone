import { Plugin, PluginFactory } from "@todone/types";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

const pattern = new URLPattern({
  protocol: "date",
  hostname: "",
  pathname: ":date",
});

const matchPattern = (url: URL) =>
  Effect.andThen(
    Effect.sync(() => pattern.exec(url)),
    Schema.decodeUnknown(
      Schema.Struct({
        pathname: Schema.Struct({
          groups: Schema.Struct({
            date: Schema.String,
          }),
        }),
      }),
    ),
  );

const decodeDate = Schema.decodeUnknown(Schema.DateFromString);

export default Layer.succeed(Plugin, {
  name: "Date",

  pattern,

  check: ({ url }) =>
    Effect.gen(function* () {
      const {
        pathname: {
          groups: { date },
        },
      } = yield* matchPattern(url);

      const expirationDate = yield* decodeDate(date);

      const isExpired = +expirationDate < Date.now();

      return {
        title: date,
        isExpired,
        expirationDate,
      };
    }),
}) satisfies PluginFactory<unknown>;
