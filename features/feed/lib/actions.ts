"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { createPostSchema, type CreatePostData } from "../schemas/post";

export const createPost = async (data: CreatePostData) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to create a post" };
  }

  try {
    const validatedData = createPostSchema.parse(data);

    const post = await prisma.post.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        authorId: user.id,
      },
    });

    revalidatePath("/feed");

    // Return success instead of redirecting
    return { success: true, postId: post.id };
  } catch (error) {
    console.error("Post creation error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create post" };
  }
};
