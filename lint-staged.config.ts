// @ts-check

const prettier = "prettier --write --ignore-unknown";
const oxlint = "oxlint --fix";

export default {
  "*": prettier,
  "*.{js,jsx,ts,tsx,mjs,cjs}": [oxlint, prettier],
  "yarn.lock": () => "yarn dedupe",
};
