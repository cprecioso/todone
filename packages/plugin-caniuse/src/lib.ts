import browserslist from "browserslist";
import * as db from "caniuse-lite";

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
