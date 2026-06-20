import * as Effect from "effect/Effect";
import { flow, pipe, satisfies } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { Checker, PluginFactory } from "todone/plugin";
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

export const checker = Effect.sync(
  (): Checker => ({
    name: "Date Checker",
    checkMatch: flow(
      Option.liftPredicate(({ url }) => pattern.test(url)),
      Option.map(({ url }) =>
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
  satisfies<PluginFactory>(),
);
