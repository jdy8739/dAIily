import { z } from "zod";

export const createReplySchema = z.object({
  content: z
    .string()
    .min(1, "Reply content is required")
    .max(1000, "Reply must be less than 1000 characters"),
  postId: z.string().min(1, "Post ID is required"),
});

export const editReplySchema = z.object({
  content: z
    .string()
    .min(1, "Reply content is required")
    .max(1000, "Reply must be less than 1000 characters"),
  replyId: z.string().min(1, "Reply ID is required"),
});

export type CreateReplyData = z.infer<typeof createReplySchema>;
export type EditReplyData = z.infer<typeof editReplySchema>;