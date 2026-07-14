import { loadConfig } from "c12";
import * as z from "zod";
import { PluginOption } from "../plugin";
import { shorthands } from "../util/schema";

const PluginOptionSchema = z.custom<PluginOption>();

export interface Config extends z.infer<typeof ConfigSchema> {}
export interface ConfigInput extends z.input<typeof ConfigSchema> {}

const globs = shorthands(z.string().array(), [
  z.string().transform((pattern) => [pattern]),
]);

export const ConfigSchema = z.object({
  /** The keyword to use for TODO comments. */
  keyword: z.string().prefault("@TODO"),

  /** The files to include. */
  include: shorthands(
    z.object({
      /** A glob to run against the file system to include files. */
      patterns: globs.prefault(["**/*"]),
    }),
    [globs.transform((patterns) => ({ patterns }))],
  ).prefault({}),

  /** The files to exclude. */
  exclude: shorthands(
    z.intersection(
      z
        .object({
          /** A glob to run against the matched files to exclude unwanted ones. */
          patterns: globs.prefault([]),

          /**
           * We always include some default exclude patterns (currently
           * `node_modules/**` and `.git/**`) to avoid scanning unnecessary
           * files. If you want to include them or specify these patterns
           * yourself in `exclude.patterns`, you can set this to `true`.
           */
          ignoreDefault: z.boolean().prefault(false),
        })
        .transform(({ patterns, ignoreDefault }) => ({
          patterns: [
            ...patterns,
            ...(ignoreDefault ? [] : ["node_modules/**", ".git/**"]),
          ],
        })),
      z.object({
        /** Whether to respect `.gitignore` files. */
        gitignore: z.boolean().prefault(true),
      }),
    ),
    [globs.transform((patterns) => ({ patterns }))],
  ).prefault({}),

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
