import * as z from "zod";

export const GithubPluginOptionsSchema = z.object({
  /** GitHub API token. Defaults to `process.env.GITHUB_TOKEN`. */
  token: z
    .string()
    .optional()
    .prefault(() => process.env.GITHUB_TOKEN),
});

export interface GithubPluginOptions extends z.infer<
  typeof GithubPluginOptionsSchema
> {}

export interface GithubPluginOptionsInput extends z.input<
  typeof GithubPluginOptionsSchema
> {}
