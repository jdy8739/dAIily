"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { logger } from "../../../lib/logger";
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

const createPost = async (
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
    logger.error({ err: error }, "Post creation error");
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create post" };
  }
};

const editPost = async (data: EditPostData, status?: "DRAFT" | "PUBLISHED") => {
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
    logger.error({ err: error, postId: data.postId }, "Post edit error");
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to edit post" };
  }
};

const deletePost = async (postId: string, csrfToken?: string) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to delete a post" };
  }

  // CSRF Protection
  const { validateCsrf } = await import("@/lib/csrf-middleware");
  if (!validateCsrf(csrfToken)) {
    return { error: "Invalid CSRF token" };
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
    logger.error({ err: error, postId }, "Post deletion error");
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete post" };
  }
};

const likePost = async (postId: string) => {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "You must be logged in to like a post" };
  }

  try {
    // Check post exists and if user already liked in parallel
    const [post, existingLike] = await Promise.all([
      prisma.post.findUnique({
        where: { id: postId },
        select: { id: true },
      }),
      prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: user.id,
            postId: postId,
          },
        },
      }),
    ]);

    if (!post) {
      return { error: "Post not found" };
    }

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
    logger.error({ err: error, postId }, "Like post error");
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to like post" };
  }
};

const unlikePost = async (postId: string) => {
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
    logger.error({ err: error, postId }, "Unlike post error");
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to unlike post" };
  }
};

const createReply = async (data: CreateReplyData) => {
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
    logger.error({ err: error, postId: data.postId }, "Reply creation error");
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to create reply" };
  }
};

const editReply = async (data: EditReplyData) => {
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
    logger.error({ err: error, replyId: data.replyId }, "Reply edit error");
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to edit reply" };
  }
};

const deleteReply = async (replyId: string) => {
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
    logger.error({ err: error, replyId }, "Reply deletion error");
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete reply" };
  }
};

/**
 * Load more feed posts for infinite scroll
 * @param page - Page number (1-indexed)
 * @param itemsPerPage - Number of items per page (default: 10)
 */
const loadMoreFeedPosts = async (page: number, itemsPerPage: number = 10) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    });

    return {
      items: posts,
      hasMore: posts.length === itemsPerPage,
    };
  } catch (error) {
    logger.error(
      { err: error, page, itemsPerPage },
      "Error loading more feed posts"
    );
    return {
      items: [],
      hasMore: false,
    };
  }
};

/**
 * Load more draft posts for infinite scroll
 * @param page - Page number (1-indexed)
 * @param itemsPerPage - Number of items per page (default: 10)
 */
const loadMoreDraftPosts = async (page: number, itemsPerPage: number = 10) => {
  const user = await getCurrentUser();

  if (!user) {
    return {
      items: [],
      hasMore: false,
    };
  }

  try {
    const drafts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        status: "DRAFT",
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    });

    return {
      items: drafts,
      hasMore: drafts.length === itemsPerPage,
    };
  } catch (error) {
    logger.error(
      { err: error, page, itemsPerPage },
      "Error loading more draft posts"
    );
    return {
      items: [],
      hasMore: false,
    };
  }
};

/**
 * Load more user posts for infinite scroll
 * @param userId - User ID
 * @param page - Page number (1-indexed)
 * @param itemsPerPage - Number of items per page (default: 10)
 */
const loadMoreUserPosts = async (
  userId: string,
  page: number,
  itemsPerPage: number = 10
) => {
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    });

    return {
      items: posts,
      hasMore: posts.length === itemsPerPage,
    };
  } catch (error) {
    logger.error(
      { err: error, userId, page, itemsPerPage },
      "Error loading more user posts"
    );
    return {
      items: [],
      hasMore: false,
    };
  }
};

export {
  createPost,
  editPost,
  deletePost,
  likePost,
  unlikePost,
  createReply,
  editReply,
  deleteReply,
  loadMoreFeedPosts,
  loadMoreDraftPosts,
  loadMoreUserPosts,
};
