import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be less than 5000 characters"),
});

export type CreatePostData = z.infer<typeof createPostSchema>;