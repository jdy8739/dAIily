"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import {
  createPostSchema,
  editPostSchema,
  type CreatePostData,
  type EditPostData,
} from "../schemas/post";
import {
  createReplySchema,
  editReplySchema,
  type CreateReplyData,
  type EditReplyData,
} from "../schemas/reply";

export const createPost = async (
  data: CreatePostData,
  status: "DRAFT" | "PUBLISHED" = "PUBLISHED"
) => {
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
        status,
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

export const editPost = async (
  data: EditPostData,
  status?: "DRAFT" | "PUBLISHED"
) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to edit a post" };
  }

  try {
    const validatedData = editPostSchema.parse(data);

    // Get the post to check ownership
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      select: { authorId: true },
    });

    if (!post) {
      return { error: "Post not found" };
    }

    // Check if user is the post author
    if (post.authorId !== user.id) {
      return { error: "You can only edit your own posts" };
    }

    // Update the post
    await prisma.post.update({
      where: { id: validatedData.postId },
      data: {
        title: validatedData.title,
        content: validatedData.content,
        ...(status && { status }),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/feed");
    revalidatePath(`/feed/${validatedData.postId}`);

    return { success: true };
  } catch (error) {
    console.error("Post edit error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to edit post" };
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

export const createReply = async (data: CreateReplyData) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to reply" };
  }

  try {
    const validatedData = createReplySchema.parse(data);

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: validatedData.postId },
      select: { id: true },
    });

    if (!post) {
      return { error: "Post not found" };
    }

    // Create the reply
    const reply = await prisma.reply.create({
      data: {
        content: validatedData.content,
        authorId: user.id,
        postId: validatedData.postId,
      },
    });

    revalidatePath("/feed");
    revalidatePath(`/feed/${validatedData.postId}`);

    return { success: true, replyId: reply.id };
  } catch (error) {
    console.error("Reply creation error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create reply" };
  }
};

export const editReply = async (data: EditReplyData) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to edit a reply" };
  }

  try {
    const validatedData = editReplySchema.parse(data);

    // Get the reply to check ownership
    const reply = await prisma.reply.findUnique({
      where: { id: validatedData.replyId },
      select: { authorId: true, postId: true },
    });

    if (!reply) {
      return { error: "Reply not found" };
    }

    // Check if user is the reply author
    if (reply.authorId !== user.id) {
      return { error: "You can only edit your own replies" };
    }

    // Update the reply
    await prisma.reply.update({
      where: { id: validatedData.replyId },
      data: {
        content: validatedData.content,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/feed");
    revalidatePath(`/feed/${reply.postId}`);

    return { success: true };
  } catch (error) {
    console.error("Reply edit error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to edit reply" };
  }
};

export const deleteReply = async (replyId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to delete a reply" };
  }

  try {
    // Get the reply with post information
    const reply = await prisma.reply.findUnique({
      where: { id: replyId },
      include: {
        post: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!reply) {
      return { error: "Reply not found" };
    }

    // Check if user is the reply author or the post owner
    const isReplyAuthor = reply.authorId === user.id;
    const isPostOwner = reply.post.authorId === user.id;

    if (!isReplyAuthor && !isPostOwner) {
      return {
        error: "You can only delete your own replies or replies on your posts",
      };
    }

    // Delete the reply
    await prisma.reply.delete({
      where: { id: replyId },
    });

    revalidatePath("/feed");
    revalidatePath(`/feed/${reply.postId}`);

    return { success: true };
  } catch (error) {
    console.error("Reply deletion error:", error);
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete reply" };
  }
};
