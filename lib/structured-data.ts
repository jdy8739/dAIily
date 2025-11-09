import { env } from "./env";

/**
 * Structured Data (JSON-LD) helper functions for rich search results
 * Following schema.org specifications
 */

type Organization = {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
};

type WebSite = {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
};

type Article = {
  "@context": "https://schema.org";
  "@type": "Article";
  headline: string;
  description: string;
  author: {
    "@type": "Person";
    name: string;
    url?: string;
  };
  datePublished: string;
  dateModified: string;
  url: string;
  image?: string;
};

type Person = {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  description?: string;
  image?: string;
  jobTitle?: string;
};

type ProfilePage = {
  "@context": "https://schema.org";
  "@type": "ProfilePage";
  name: string;
  url: string;
  mainEntity: Person;
};

type BreadcrumbList = {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
};

/**
 * Generate Organization schema for root layout
 */
const generateOrganizationSchema = (): Organization => {
  const baseUrl = env.NEXTAUTH_URL;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Daiily",
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description:
      "Professional growth diary platform for sharing daily experiences and tracking career development",
  };
};

/**
 * Generate WebSite schema for root layout
 */
const generateWebSiteSchema = (): WebSite => {
  const baseUrl = env.NEXTAUTH_URL;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Daiily - Professional Growth Diary",
    url: baseUrl,
    description:
      "Share daily professional experiences, track growth, and learn from others in your field",
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/feed?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
};

/**
 * Generate Article schema for post pages
 */
const generateArticleSchema = (params: {
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  publishedAt: Date;
  updatedAt: Date;
  postId: string;
}): Article => {
  const baseUrl = env.NEXTAUTH_URL;
  const { title, content, authorName, authorId, publishedAt, updatedAt, postId } =
    params;

  // Truncate content for description (max 160 chars)
  const description =
    content.length > 160 ? `${content.substring(0, 157)}...` : content;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: authorName,
      url: `${baseUrl}/story/${authorId}`,
    },
    datePublished: publishedAt.toISOString(),
    dateModified: updatedAt.toISOString(),
    url: `${baseUrl}/feed/${postId}`,
  };
};

/**
 * Generate Person schema
 */
const generatePersonSchema = (params: {
  name: string;
  userId: string;
  bio?: string;
  image?: string;
  currentRole?: string;
}): Person => {
  const baseUrl = env.NEXTAUTH_URL;
  const { name, userId, bio, image, currentRole } = params;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${baseUrl}/story/${userId}`,
    description: bio,
    image: image || undefined,
    jobTitle: currentRole,
  };
};

/**
 * Generate ProfilePage schema for user profile pages
 */
const generateProfilePageSchema = (params: {
  name: string;
  userId: string;
  bio?: string;
  image?: string;
  currentRole?: string;
}): ProfilePage => {
  const baseUrl = env.NEXTAUTH_URL;
  const { name, userId, bio, image, currentRole } = params;

  const person = generatePersonSchema({ name, userId, bio, image, currentRole });

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${name}'s Profile - Daiily`,
    url: `${baseUrl}/story/${userId}`,
    mainEntity: person,
  };
};

/**
 * Generate BreadcrumbList schema
 */
const generateBreadcrumbSchema = (
  items: Array<{ name: string; url: string }>
): BreadcrumbList => {
  const baseUrl = env.NEXTAUTH_URL;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };
};

export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateArticleSchema,
  generatePersonSchema,
  generateProfilePageSchema,
  generateBreadcrumbSchema,
};

export type {
  Organization,
  WebSite,
  Article,
  Person,
  ProfilePage,
  BreadcrumbList,
};
