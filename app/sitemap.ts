import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const baseUrl = env.NEXTAUTH_URL;

  let publishedPosts: { id: string; updatedAt: Date }[] = [];
  let verifiedUsers: { id: string; updatedAt: Date }[] = [];

  try {
    // Fetch all published posts
    publishedPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    // Fetch all users with verified accounts (for story pages)
    verifiedUsers = await prisma.user.findMany({
      where: { verified: true },
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    // Database not available during build - return static pages only
    console.warn("Database not available for sitemap generation, returning static pages only");
  }

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/story`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic post pages
  const postPages: MetadataRoute.Sitemap = publishedPosts.map(post => ({
    url: `${baseUrl}/feed/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic user story pages
  const userStoryPages: MetadataRoute.Sitemap = verifiedUsers.map(user => ({
    url: `${baseUrl}/story/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Dynamic user feed pages
  const userFeedPages: MetadataRoute.Sitemap = verifiedUsers.map(user => ({
    url: `${baseUrl}/feed/user/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  // Combine all pages
  return [...staticPages, ...postPages, ...userStoryPages, ...userFeedPages];
};

export default sitemap;
