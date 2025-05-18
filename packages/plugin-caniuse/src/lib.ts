import { assert } from "@std/assert";
import { File } from "@todone/types";
import browserslist from "browserslist";
import * as db from "caniuse-lite";
import { fileURLToPath } from "node:url";

export const getBrowsers = (file: File) => {
  assert(file.isPresent);
  const path = fileURLToPath(file.url);
  const browsers = browserslist(undefined, { path }).map((browserString) => {
    const [browser, version] = browserString.split(" ", 2);
    return { browser, version };
  });

  if (browsers.length === 0) throw new Error("No browsers found");

  return browsers;
};

export const getFeatureInfo = (feature: string) =>
  db.feature(db.features[feature]);
