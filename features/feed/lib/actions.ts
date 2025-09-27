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

export const deletePost = async (postId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to delete a post" };
  }

  try {
    // First check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) {
      return { error: "Post not found" };
    }

    if (post.authorId !== user.id) {
      return { error: "You can only delete your own posts" };
    }

    // Delete the post
    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/feed");
    revalidatePath(`/feed/${postId}`);

    return { success: true };
  } catch (error) {
    console.error("Post deletion error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete post" };
  }
};

export const likePost = async (postId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to like a post" };
  }

  try {
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return { error: "Post not found" };
    }

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    if (existingLike) {
      return { error: "You have already liked this post" };
    }

    // Create the like
    await prisma.like.create({
      data: {
        userId: user.id,
        postId: postId,
      },
    });

    revalidatePath("/feed");
    revalidatePath(`/feed/${postId}`);

    return { success: true };
  } catch (error) {
    console.error("Like post error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to like post" };
  }
};

export const unlikePost = async (postId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to unlike a post" };
  }

  try {
    // Check if user has liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    if (!existingLike) {
      return { error: "You have not liked this post" };
    }

    // Remove the like
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: user.id,
          postId: postId,
        },
      },
    });

    revalidatePath("/feed");
    revalidatePath(`/feed/${postId}`);

    return { success: true };
  } catch (error) {
    console.error("Unlike post error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to unlike post" };
  }
};
