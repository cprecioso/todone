import { Plugin, PluginFactory } from "@todone/types";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Schema from "effect/Schema";
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

export const makeCaniusePlugin = (browserslist: string[]) =>
  Effect.sync((): Plugin => {
    const browsers = getBrowsers(browserslist);

    return {
      name: "Caniuse",

      pattern,

      check: ({ url }) =>
        Effect.gen(function* () {
          const {
            pathname: {
              groups: { feature },
            },
          } = yield* matchPattern(url);

          const featureInfo = getFeatureInfo(feature);

          const enabledFlags = new Set((url.hash.slice(1) || null)?.split(","));

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
    };
  });

export default pipe(
  Config.array(Config.string(), "BROWSERSLIST"),
  Effect.andThen(makeCaniusePlugin),
) satisfies PluginFactory<unknown>;
