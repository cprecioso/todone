// @ts-check

const prettier = "prettier --write --ignore-unknown";

export default {
  "*": prettier,
  "yarn.lock": () => "yarn dedupe",
};
