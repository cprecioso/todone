import browserslist from "browserslist";
import * as db from "caniuse-lite";
import { CaniuseFlags, UrlFlags } from "./flags";

export const getBrowsers = (input: string | string[]) => {
  const browsers = browserslist(input).map((browserString) => {
    const [browser, version] = browserString.split(" ", 2);
    return { browser, version };
  });

  if (browsers.length === 0) throw new Error("No browsers found");

  return browsers;
};

export const getFeatureInfo = (feature: string) =>
  db.feature(db.features[feature]);

export const checkFeatureSupport = (
  featureInfo: db.Feature,
  enabledFlags: Set<string>,
  { browser, version }: { browser: string; version: string },
) => {
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
};
