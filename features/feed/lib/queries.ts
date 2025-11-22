import { cache } from "react";
import { prisma } from "../../../lib/prisma";

/**
 * Get all posts for the feed page with author, likes, and reply counts
 * Ordered by creation date (newest first)
 * Only shows published posts
 * @param limit - Number of posts to fetch (default: 10)
 */
const getFeedPosts = async (limit: number = 10) => {
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
    take: limit,
  });
};

/**
 * Get a single post by ID with full details including replies
 * Cached per request to deduplicate metadata and component queries
 * Returns null if post not found
 */
const getPostById = cache(async (id: string) => {
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
});

/**
 * Get a post for editing (minimal data, author only)
 * Returns null if post not found
 */
const getPostForEdit = async (id: string) => {
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
 * @param userId - User ID
 * @param limit - Number of posts to fetch (default: 10)
 */
const getUserPosts = async (userId: string, limit: number = 10) => {
  return prisma.post.findMany({
    where: { authorId: userId },
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
    take: limit,
  });
};

/**
 * Get user data by ID with profile information
 * Cached per request to deduplicate metadata and component queries
 * Returns null if user not found
 */
const getUserById = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      createdAt: true,
      currentRole: true,
      industry: true,
      currentGoals: true,
    },
  });
});

/**
 * Get all draft posts by a specific user
 * Ordered by creation date (newest first)
 * @param userId - User ID
 * @param limit - Number of drafts to fetch (default: 10)
 */
const getUserDraftPosts = async (userId: string, limit: number = 10) => {
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
    take: limit,
  });
};

export {
  getFeedPosts,
  getPostById,
  getPostForEdit,
  getUserPosts,
  getUserById,
  getUserDraftPosts,
};
