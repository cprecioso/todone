import type { Plugin } from "#/plugin";

/** A reporter that reports nothing. */
export const silentReporter = (): Plugin => ({
  name: "todone:reporter-silent",
});
