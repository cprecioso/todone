import type { PluginInstance } from "@todone/types";

export interface TodoneOptions {
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

export const defaultTodoneOptions: TodoneOptions = {
  keyword: "@TODO",
  plugins: [],
  warnLogger: defaultWarnLogger,
};

export const normalizeOptions = (
  partialOptions: Partial<TodoneOptions>,
): TodoneOptions => ({ ...defaultTodoneOptions, ...partialOptions });
