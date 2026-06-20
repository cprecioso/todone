import * as Schema from "effect/Schema";

export const BUILTIN_PLUGIN_NAME = "builtin";

export const Config = Schema.Struct({
  keyword: Schema.optionalWith(Schema.String, { default: () => "@TODO" }),

  gitignore: Schema.optionalWith(Schema.Boolean, { default: () => true }),

  globs: Schema.optionalWith(Schema.Array(Schema.String), {
    default: () => ["**/*"],
  }),

  reporter: Schema.optionalWith(Schema.String, { default: () => "auto" }),

  plugins: Schema.optionalWith(
    Schema.Record({
      key: Schema.String,
      value: Schema.Record({
        key: Schema.String,
        value: Schema.Unknown,
      }),
    }),
    { default: () => ({}) },
  ),
});

export interface Config extends Schema.Schema.Type<typeof Config> {}
