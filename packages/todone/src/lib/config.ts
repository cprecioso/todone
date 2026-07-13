import { loadConfig } from "c12";
import * as z from "zod";
import { PluginOption } from "../plugin";

const PluginOptionSchema = z.custom<PluginOption>();

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
  plugins: z.array(PluginOptionSchema).prefault([]),
});

export const loadConfigFile = async (path?: string) => {
  const { config } = await loadConfig({
    name: "todone",
    rcFile: false,
    cwd: path,
  });
  return ConfigSchema.parse(config);
};
