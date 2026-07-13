import type { Plugin } from "#/plugin";

/** A reporter that reports nothing. */
export const silentReporter = async (): Promise<Plugin> => ({
  name: "todone:silent-reporter",
});
