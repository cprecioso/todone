import * as z from "zod";

export const CreateIssuesOptionsSchema = z.object({
  /**
   * Issues with this label are managed by the plugin.
   *
   * Defaults to `todone`.
   */
  label: z.string().prefault("todone"),
});

export interface CreateIssuesOptions extends z.infer<
  typeof CreateIssuesOptionsSchema
> {}
