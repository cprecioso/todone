import * as z from "zod";

export const CreateIssuesOptionsSchema = z.object({
  /**
   * Issues with this label are managed by the plugin.
   *
   * Defaults to `todone`.
   */
  label: z.string().prefault("todone"),

  /**
   * The maximum number of issues to fetch from the repository when reconciling
   * TODOs against the open issues. This is a safeguard against repositories with
   * a large number of open issues.
   *
   * Defaults to `100`.
   */
  limit: z.number().int().positive().prefault(100),
});

export interface CreateIssuesOptions extends z.infer<
  typeof CreateIssuesOptionsSchema
> {}
