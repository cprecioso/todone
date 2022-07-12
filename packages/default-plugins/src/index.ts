import caniuse from "@todone/plugin-caniuse";
import date from "@todone/plugin-date";
import figma from "@todone/plugin-figma";
import github from "@todone/plugin-github";
import { PluginInstance } from "@todone/types";

export const pluginsByName: Record<string, () => PluginInstance> = {
  caniuse,
  date,
  figma,
  github,
};

export const allPlugins = Object.values(pluginsByName);
