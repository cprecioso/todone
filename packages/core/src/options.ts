import type { PluginFactory } from "@todone/types";

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
  plugins: readonly PluginFactory[];

  /**
   * If `true`, when a plugin errors while instantiating,
   * just print a message and ignore said plugin.
   */
  toleratePluginInstantiationErrors: boolean;

  /**
   * Where to log errors
   */
  warnLogger: (line: string) => void;
}

const defaultWarnLogger = console.error.bind(console);

export const defaultTodoneOptions: TodoneOptions = {
  keyword: "@TODO",
  plugins: [],
  toleratePluginInstantiationErrors: false,
  warnLogger: defaultWarnLogger,
};

export const normalizeOptions = (
  partialOptions: Partial<TodoneOptions>,
): TodoneOptions => ({ ...defaultTodoneOptions, ...partialOptions });
