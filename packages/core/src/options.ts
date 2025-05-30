import type { PluginInstance } from "@todone/types";

export interface Options {
  /**
   * Keyword to match against
   *
   * @default "@TODO"
   */
  keyword: string;

  /**
   * Plugins that matches will be run through
   */
  plugins: readonly PluginInstance[];

  /**
   * Where to log errors
   */
  warnLogger: (line: string) => void;
}

const defaultWarnLogger = console.error.bind(console);

export const defaultTodoneOptions: Options = {
  keyword: "@TODO",
  plugins: [],
  warnLogger: defaultWarnLogger,
};

export const normalizeOptions = (
  partialOptions: Partial<Options>,
): Options => ({ ...defaultTodoneOptions, ...partialOptions });
