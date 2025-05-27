import * as z from "zod/v4-mini";

export const commentSchema = z.object({
  id: z.string(),
  resolved_at: z.optional(z.coerce.date()),
  user: z.object({ handle: z.string() }),
});

export const commentsResponseSchema = z.object({
  comments: z.optional(z.array(commentSchema)),
});
