import { assert } from "@std/assert";
import { File } from "@todone/types";
import browserslist from "browserslist";
import * as db from "caniuse-lite";

export const getBrowsers = (file: File) => {
  assert(file.localPath, "This plugin requires the file to be present");
  const browsers = browserslist(undefined, { path: file.localPath }).map(
    (browserString) => {
      const [browser, version] = browserString.split(" ", 2);
      return { browser, version };
    },
  );

  if (browsers.length === 0) throw new Error("No browsers found");

  return browsers;
};

export const getFeatureInfo = (feature: string) =>
  db.feature(db.features[feature]);
