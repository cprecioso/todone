import { assert } from "@std/assert";
import URLPattern from "@todone/internal-urlpattern";
import { File, Match, definePlugin } from "@todone/types";
import browserslist from "browserslist";
import * as db from "caniuse-lite";
import { fileURLToPath } from "node:url";
import { CaniuseFlags, UrlFlags } from "./flags";

class CaniusePlugin {
  static displayName = "Caniuse";

  static readonly pattern = new URLPattern({
    protocol: "http{s}?",
    hostname: "{www.}?caniuse.com",
    pathname: "/:feature",
  });

  static async make() {
    return new this();
  }

  #getBrowsers(file: File) {
    assert(file.isPresent);
    const path = fileURLToPath(file.url);
    const browsers = browserslist(undefined, { path }).map((browserString) => {
      const [browser, version] = browserString.split(" ", 2);
      return { browser, version };
    });

    if (browsers.length === 0) throw new Error("No browsers found");

    return browsers;
  }

  #getFeatureInfo(feature: string) {
    return db.feature(db.features[feature]);
  }

  async check({ url, file }: Match) {
    const result = CaniusePlugin.pattern.exec(url);
    assert(result);

    const { feature } = result.pathname.groups;
    if (!feature) return null;

    const browsers = this.#getBrowsers(file);
    const featureInfo = this.#getFeatureInfo(feature);

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
  }
}

export default definePlugin(CaniusePlugin);
