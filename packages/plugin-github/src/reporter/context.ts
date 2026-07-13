import * as z from "zod";

/**
 * The pieces of GitHub context the reporting side needs to build permalinks
 * and issue links.
 */
export const GitHubContextSchema = z.object({
  /**
   * The GitHub server to use.
   *
   * Defaults to `process.env.GITHUB_SERVER_URL` (already set on GitHub Actions).
   */
  server: z
    .string()
    .nonempty()
    .optional()
    .prefault(() => process.env.GITHUB_SERVER_URL || "https://github.com"),

  /**
   * The repository the run belongs to, in the `owner/repo` format. Used to
   * link files and issues in the job summary, and as the repository to sync
   * issues against.
   *
   * Defaults to `process.env.GITHUB_REPOSITORY` (already set on GitHub Actions).
   */
  repository: z
    .string()
    .nonempty()
    .pipe(z.templateLiteral([z.string(), "/", z.string()]))
    .transform((repository) => {
      const [owner, repo] = repository.split("/", 2);
      return { owner, repo };
    })
    .optional()
    .prefault(() => process.env.GITHUB_REPOSITORY),

  /**
   * The SHA of the commit that triggered the run. Used to link files in the job summary.
   *
   * Defaults to `process.env.GITHUB_SHA` (already set on GitHub Actions).
   */
  sha: z
    .string()
    .nonempty()
    .optional()
    .prefault(() => process.env.GITHUB_SHA),
});

export interface GitHubContext extends z.infer<typeof GitHubContextSchema> {}
