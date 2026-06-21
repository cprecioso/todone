import * as Schema from "effect/Schema";

const optionalKey = <S extends Schema.Schema.All>(
  schema: S,
  defaultValue: Schema.Schema.Type<S>,
) =>
  Schema.optionalWith(schema, { default: () => defaultValue }).annotations({
    default: defaultValue,
  });

export const Config = Schema.Struct({
  $schema: Schema.optional(Schema.String),

  keyword: optionalKey(Schema.String, "@TODO").annotations({
    description: "The keyword to use for TODO comments.",
  }),

  gitignore: optionalKey(Schema.Boolean, true).annotations({
    description: "Whether to respect .gitignore files.",
  }),

  globs: optionalKey(Schema.Array(Schema.String), ["**/*"]).annotations({
    description: "The file patterns to include.",
  }),

  reporter: optionalKey(Schema.String, "auto").annotations({
    description:
      "The reporter to use. Can be 'auto', 'cli', 'json', or the ID of a custom reporter.",
    examples: ["auto", "cli", "json", "my-custom-reporter"],
  }),

  plugins: optionalKey(
    Schema.Record({
      key: Schema.String,
      value: Schema.Unknown.annotations({
        description:
          "The configuration to pass to the plugin. Can be any valid JSON value, the plugin is in charge of validating it.",
      }),
    }),
    {},
  ).annotations({
    description:
      "An object with keys being the package names of plugins to load, and values being any configuration you want to pass them.",
  }),
});

export interface Config extends Schema.Schema.Type<typeof Config> {}
export interface ConfigInput extends Schema.Schema.Encoded<typeof Config> {}
