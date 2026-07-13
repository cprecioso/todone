import type { Reporter } from "#/plugin";

/** A reporter that reports nothing. */
export const silentReporter = async (): Promise<Reporter> => ({});
