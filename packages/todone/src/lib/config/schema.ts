import * as z from "zod";
import type { Plugin, Reporter } from "../plugins";

const PluginSchema = z.custom<Plugin>(
  (value): value is Plugin =>
    typeof value === "object" &&
    value !== null &&
    typeof (value as Plugin).name === "string" &&
    typeof (value as Plugin).checkMatch === "function",
  {
    error:
      "Expected a todone plugin object ({ name, checkMatch }). Did you forget to call the plugin factory, e.g. `githubPlugin()`?",
  },
);

const ReporterSchema = z.custom<Reporter>(
  (value): value is Reporter =>
    typeof value === "object" &&
    value !== null &&
    typeof (value as Reporter).reportResult === "function" &&
    typeof (value as Reporter).info === "function" &&
    Symbol.asyncDispose in value,
  {
    error:
      'Expected a todone reporter object (e.g. `cliReporter()` from "todone/reporters").',
  },
);

export const Config = z.object({
  /** The keyword to use for TODO comments. */
  keyword: z.string().prefault("@TODO"),

  /** Whether to respect .gitignore files. */
  gitignore: z.boolean().prefault(true),

  /** The file patterns to include. */
  globs: z.array(z.string()).prefault(["**/*"]),

  /** What to do when no plugin returns a result for a URL. */
  unhandledUrls: z.enum(["ignore", "warn", "error"]).prefault("error"),

  /** The reporter to emit results through. Defaults to CLI output on a TTY, NDJSON otherwise. */
  reporter: ReporterSchema.optional(),

  /** The plugins to check TODO URLs with, already initialized by calling each plugin's factory. */
  plugins: z.array(PluginSchema).prefault([]),
});

export interface Config extends z.infer<typeof Config> {}
export interface ConfigInput extends z.input<typeof Config> {}
