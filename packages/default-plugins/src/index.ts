import caniuse from "@todone/plugin-caniuse";
import date from "@todone/plugin-date";
import figma from "@todone/plugin-figma";
import github from "@todone/plugin-github";

/**
 * Default plugins recommended for most users to use with todone.
 */
const defaultPlugins = [caniuse, date, figma, github] as const;

export default defaultPlugins;
