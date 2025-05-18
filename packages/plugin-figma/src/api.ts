import * as z from "zod/v4";

export const commentSchema = z.object({
  id: z.string(),
  resolved_at: z.coerce.date().optional(),
});

export const commentsResponseSchema = z.object({
  comments: z.array(commentSchema).optional(),
});
