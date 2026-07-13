import * as z from "zod";
import { GitHubContextSchema } from "./reporter/context";
import { CreateIssuesOptionsSchema } from "./reporter/options";

/* Based on https://docs.github.com/en/actions/reference/workflows-and-actions/variables#:~:text=actions/checkout.-,GITHUB_ACTIONS */
const isGithubActionsEnv = process.env.GITHUB_ACTIONS === "true";

export const GithubPluginOptionsSchema = z.object({
  /** GitHub API token. Defaults to `process.env.GITHUB_TOKEN`. */
  token: z.string().optional().prefault(process.env.GITHUB_TOKEN),

  /**
   * The GitHub repository the run belongs to, in the `owner/repo` format. Used
   * to link files and issues in the job summary, and as the repository to sync
   * issues against.
   */
  context: GitHubContextSchema.prefault({}),

  /**
   *
   */
  actions: z
    .object({
      /**
       * Log messages using the GitHub Actions toolkit, instead of `console.log`.
       *
       * Defaults to `true` when running inside GitHub Actions.
       */
      logger: z
        .boolean()
        .optional()
        .prefault(() => isGithubActionsEnv),

      /**
       * Write a job summary of the results using the GitHub Actions toolkit.
       *
       * Defaults to `true` when running inside GitHub Actions.
       */
      summary: z
        .boolean()
        .optional()
        .prefault(() => isGithubActionsEnv),
    })
    .prefault({}),

  /**
   * Reconcile expired TODOs against the open `todone`-labeled issues, creating,
   * updating, and closing issues as needed. Requires a token, unless `dryRun`
   * is set.
   *
   * Defaults to `false`.
   */
  createIssues: z
    .union([
      z.literal(false),
      z
        .literal(true)
        .transform(() => ({}))
        .pipe(CreateIssuesOptionsSchema),
      CreateIssuesOptionsSchema,
    ])
    .optional()
    .prefault(false),
});

export interface GithubPluginOptions extends z.infer<
  typeof GithubPluginOptionsSchema
> {}

export interface GithubPluginOptionsInput extends z.input<
  typeof GithubPluginOptionsSchema
> {}
