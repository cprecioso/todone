import * as z from "zod";
import type { Plugin, ReporterFn } from "../plugins";
import { autoReporter } from "../reporters";

const ReporterFnSchema = z.custom<ReporterFn>();

const PluginSchema = z.custom<Plugin>();

export type UnhandledUrls = z.infer<typeof UnhandledUrlsSchema>;

const UnhandledUrlsSchema = z
  .enum(["ignore", "warn", "error"])
  .prefault("error");

export interface Config extends z.infer<typeof ConfigSchema> {}
export interface ConfigInput extends z.input<typeof ConfigSchema> {}

export const ConfigSchema = z.object({
  /** The keyword to use for TODO comments. */
  keyword: z.string().prefault("@TODO"),

  /** Whether to respect .gitignore files. */
  gitignore: z.boolean().prefault(true),

  /** The file patterns to include. */
  globs: z.array(z.string()).prefault(["**/*"]),

  /** What to do when no plugin returns a result for a URL. */
  unhandledUrls: UnhandledUrlsSchema,

  /** The reporter to emit results through. Defaults to CLI output on a TTY, NDJSON otherwise. */
  reporter: ReporterFnSchema.prefault(() => autoReporter()),

  /** The plugins to check TODO URLs with, already initialized by calling each plugin's factory. */
  plugins: z.array(PluginSchema).prefault([]),
});
