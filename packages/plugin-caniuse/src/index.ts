import { PluginFactory } from "todone/plugin";
import * as z from "zod";
import * as pkg from "../package.json" with { type: "json" };
import {
  checkFeatureSupport,
  getBrowsers,
  getBrowserslist,
  getFeatureInfo,
} from "./lib";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?caniuse.com",
  pathname: "/:feature",
});

const PatternResult = z.object({
  pathname: z.object({
    groups: z.object({
      feature: z.string(),
    }),
  }),
});

const plugin: PluginFactory = {
  id: pkg.name,
  make: async (rawOptions) => {
    const browserslist = getBrowserslist();

    return {
      checkers: [
        {
          id: `${pkg.name}/caniuse-feature`,

          make: async () => {
            const browsers = getBrowsers(browserslist);

            return {
              checkMatch: async ({ url }) => {
                const patternResult = pattern.exec(url);
                if (!patternResult) return null;

                const {
                  pathname: {
                    groups: { feature },
                  },
                } = PatternResult.parse(patternResult);

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
              },
            };
          },
        },
      ],
    };
  },
};

export default plugin;
