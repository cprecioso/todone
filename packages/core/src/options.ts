import { PluginFactory } from "@todone/types";

export interface TodoneOptions {
  plugins: readonly PluginFactory[];
  toleratePluginInstantiationErrors: boolean;
  warnLogger: (line: string) => void;
}

const defaultWarnLogger = console.error.bind(console);

export const defaultTodoneOptions: TodoneOptions = {
  plugins: [],
  toleratePluginInstantiationErrors: false,
  warnLogger: defaultWarnLogger,
};
