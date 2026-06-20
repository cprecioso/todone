import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { flow, pipe, satisfies } from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { Checker, PluginFactory } from "todone/plugin";
import { checkFeatureSupport, getBrowsers, getFeatureInfo } from "./lib";
const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?caniuse.com",
  pathname: "/:feature",
});

const matchPattern = (url: URL) =>
  Effect.andThen(
    Effect.sync(() => pattern.exec(url)),
    Schema.decodeUnknown(
      Schema.Struct({
        pathname: Schema.Struct({
          groups: Schema.Struct({
            feature: Schema.String,
          }),
        }),
      }),
    ),
  );

export const checker = Effect.map(
  Config.array(Config.string(), "BROWSERSLIST"),
  (browserslist): Checker => {
    const browsers = getBrowsers(browserslist);

    return {
      name: "Caniuse Checker",
      checkMatch: flow(
        Option.liftPredicate(({ url }) => pattern.test(url)),
        Option.map(({ url }) =>
          Effect.gen(function* () {
            const {
              pathname: {
                groups: { feature },
              },
            } = yield* matchPattern(url);

            const featureInfo = getFeatureInfo(feature);

            const enabledFlags = new Set(
              (url.hash.slice(1) || null)?.split(","),
            );

            const browserSupport = browsers
              .values()
              .map((browser) =>
                checkFeatureSupport(featureInfo, enabledFlags, browser),
              );

            const isExpired = browserSupport.every((v) => Boolean(v));

            return {
              title: featureInfo.title,
              isExpired,
            };
          }),
        ),
        Option.match({
          onSome: Effect.map(Option.some),
          onNone: () => Effect.succeed(Option.none()),
        }),
      ),
    };
  },
);

export default pipe(
  Effect.gen(function* () {
    return {
      checkers: [yield* checker],
    };
  }),
  satisfies<PluginFactory>(),
);
