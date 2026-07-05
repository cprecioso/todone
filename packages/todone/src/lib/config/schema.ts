import * as z from "zod";
import { BuiltinPluginConfig } from "../../builtin-plugin";
import { BUILTIN_PLUGIN_ID } from "../../builtin-plugin/base";

export const makePluginOptions = (
  options: z.ZodType = z.unknown().meta({
    description:
      "The configuration to pass to the plugin. Can be any valid JSON value, the plugin is in charge of validating it.",
  }),
) =>
  z.object({
    import: z.string().optional().meta({
      description:
        "The module specifier to import the plugin from. By default, this will be the key of the plugin in the plugins object.",
    }),
    options: options.optional(),
  });

export type makePluginOptions = z.infer<typeof makePluginOptions>;

export const Config = z.object({
  $schema: z.string().optional(),

  keyword: z.optional(z.string()).prefault("@TODO").meta({
    description: "The keyword to use for TODO comments.",
  }),

  gitignore: z.optional(z.boolean()).prefault(true).meta({
    description: "Whether to respect .gitignore files.",
  }),

  globs: z.optional(z.array(z.string())).prefault(["**/*"]).meta({
    description: "The file patterns to include.",
  }),

  reporter: z.optional(z.string()).prefault("auto").meta({
    description:
      "The reporter to use. Can be 'auto', 'cli', 'json', or the ID of a custom reporter.",
  }),

  plugins: z
    .optional(
      z.intersection(
        z.object({
          [BUILTIN_PLUGIN_ID]: makePluginOptions(BuiltinPluginConfig).nullish(),
        }),
        z.record(
          z.string(),
          makePluginOptions()
            .meta({ identifier: "PluginOptions" })
            .nullish()
            .meta({
              description: "The configuration for the plugin.",
            }),
        ),
      ),
    )
    .meta({
      description:
        "An object with keys being the package names of plugins to load, and values being any configuration you want to pass them.",
    }),
});

export interface Config extends z.infer<typeof Config> {}
export interface ConfigInput extends z.input<typeof Config> {}
