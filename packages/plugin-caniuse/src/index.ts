import { assert } from "@std/assert";
import URLPattern from "@todone/internal-urlpattern";
import { definePlugin } from "@todone/plugin";
import { CaniuseFlags, UrlFlags } from "./flags";
import { getBrowsers, getFeatureInfo } from "./lib";

const pattern = new URLPattern({
  protocol: "http{s}?",
  hostname: "{www.}?caniuse.com",
  pathname: "/:feature",
});

export default definePlugin(undefined, async () => ({
  name: "Caniuse",

  pattern,

  async check({ url, file }) {
    const result = pattern.exec(url);
    assert(result);

    const { feature } = result.pathname.groups;
    if (!feature) return null;

    const browsers = getBrowsers(file);
    const featureInfo = getFeatureInfo(feature);

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
}));
