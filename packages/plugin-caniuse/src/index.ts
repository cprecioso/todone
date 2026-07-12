import type { Plugin } from "todone/plugin";
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

export interface CaniusePluginOptions {
  /**
   * Browserslist queries to check feature support against.
   * Defaults to the project's browserslist config, or browserslist defaults.
   */
  browserslist?: string | readonly string[];
}

const caniusePlugin = (options: CaniusePluginOptions = {}): Plugin => {
  const browserslist =
    options.browserslist == null
      ? getBrowserslist()
      : typeof options.browserslist === "string"
        ? [options.browserslist]
        : options.browserslist;

  const browsers = getBrowsers(browserslist);

  return {
    name: pkg.name,
    checkMatch: async ({ url }) => {
      const patternResult = pattern.exec(url);
      if (!patternResult) return null;

      const {
        pathname: {
          groups: { feature },
        },
      } = PatternResult.parse(patternResult);

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
    },
  };
};

export default caniusePlugin;
