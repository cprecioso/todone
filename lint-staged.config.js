// @ts-check

const prettier = "prettier --write --ignore-unknown";

module.exports = {
  "*.{js,jsx,ts,tsx}": prettier,
  "*": prettier,
};
