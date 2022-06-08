// @ts-check

import prettier from "prettier";

export const format = (/** @type {string} */ code) =>
  prettier.format(code, { parser: "babel-ts" });
