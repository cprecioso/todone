import type { PluginFactory } from "@todone/types";

export interface TodoneOptions {
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
  plugins: [],
  toleratePluginInstantiationErrors: false,
  warnLogger: defaultWarnLogger,
};
