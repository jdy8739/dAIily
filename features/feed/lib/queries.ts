import { prisma } from "../../../lib/prisma";

/**
 * Get all posts for the feed page with author, likes, and reply counts
 * Ordered by creation date (oldest first)
 * Only shows published posts
 */
export const getFeedPosts = async () => {
  return prisma.post.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      likes: {
        select: {
          userId: true,
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
  });
};

/**
 * Get a single post by ID with full details including replies
 * Returns null if post not found
 */
export const getPostById = async (id: string) => {
  return prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
      _count: {
        select: {
          likes: true,
          replies: true,
        },
      },
      replies: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

/**
 * Get a post for editing (minimal data, author only)
 * Returns null if post not found
 */
export const getPostForEdit = async (id: string) => {
  return prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      content: true,
      status: true,
      authorId: true,
    },
  });
};

/**
 * Get all posts by a specific user
 * Ordered by creation date (newest first)
 */
export const getUserPosts = async (userId: string) => {
  return prisma.post.findMany({
    where: { authorId: userId },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      likes: {
        select: {
          userId: true,
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
  });
};

/**
 * Get user data by ID with name only
 * Returns null if user not found
 */
export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
    },
  });
};

/**
 * Get all draft posts by a specific user
 * Ordered by creation date (newest first)
 */
export const getUserDraftPosts = async (userId: string) => {
  return prisma.post.findMany({
    where: {
      authorId: userId,
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
  });
};
