import caniuse from "@todone/plugin-caniuse";
import date from "@todone/plugin-date";
import figma from "@todone/plugin-figma";
import github from "@todone/plugin-github";
import type { PluginFactory } from "@todone/types";

export const pluginsByName: Record<string, PluginFactory> = {
  caniuse,
  date,
  figma,
  github,
};

export const allPlugins: readonly PluginFactory[] =
  Object.values(pluginsByName);
