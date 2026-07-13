import * as z from "zod";
import type { Plugin } from "../plugins";

const PluginSchema = z.custom<Plugin>();

export interface Config extends z.infer<typeof ConfigSchema> {}
export interface ConfigInput extends z.input<typeof ConfigSchema> {}

export const ConfigSchema = z.object({
  /** The keyword to use for TODO comments. */
  keyword: z.string().prefault("@TODO"),

  /** Whether to respect .gitignore files. */
  gitignore: z.boolean().prefault(true),

  /** The file patterns to include. */
  globs: z.array(z.string()).prefault(["**/*"]),

  /** The plugins to run. */
  plugins: z.array(PluginSchema).prefault([]),
});
