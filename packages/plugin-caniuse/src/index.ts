import URLPattern from "@todone/internal-urlpattern";
import type { PluginInstance } from "@todone/types";
import browserslist from "browserslist";
import * as db from "caniuse-lite";
import { CaniuseFlags, UrlFlags } from "./flags";

const issuePattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?caniuse.com",
  pathname: "/:feature",
});

const CaniusePlugin = (): PluginInstance => {
  return {
    name: "Can I use",

    async checkExpiration(url, { match }) {
      const result = issuePattern.exec(url);
      if (!result) return null;

      const { feature } = result.pathname.groups;
      if (!feature) return null;

      const browsers = browserslist(undefined, { path: match.file }).map(
        (browserString) => {
          const [browser, version] = browserString.split(" ", 2);
          return { browser, version };
        }
      );

      if (browsers.length === 0) throw new Error("No browsers found");

      const featureInfo = db.feature(db.features[feature]);

      const enabledFlags = new Set((url.hash.slice(1) || null)?.split(","));

      const browserSupport = browsers.map(({ browser, version }) => {
        const featureStatus = featureInfo.stats[browser][version];
        const caniuseFlags = new Set(featureStatus.split(" "));

        if (
          !enabledFlags.has(UrlFlags.IgnoreDisabled) &&
          caniuseFlags.has(CaniuseFlags.Disabled)
        ) {
          return false;
        }

        if (
          enabledFlags.has(UrlFlags.NoPrefix) &&
          caniuseFlags.has(CaniuseFlags.SupportedWithPrefix)
        ) {
          return false;
        }

        if (
          enabledFlags.has(UrlFlags.NoPolyfill) &&
          caniuseFlags.has(CaniuseFlags.SupportedWithPolyfill)
        ) {
          return false;
        }

        if (
          enabledFlags.has(UrlFlags.Full) &&
          caniuseFlags.has(CaniuseFlags.Partial)
        ) {
          return false;
        }

        if (
          caniuseFlags.has(CaniuseFlags.Supported) ||
          caniuseFlags.has(CaniuseFlags.Partial)
        ) {
          return true;
        }

        return false;
      });

      const isExpired = browserSupport.every((v) => Boolean(v));

      return { isExpired };
    },
  };
};

export default CaniusePlugin;
