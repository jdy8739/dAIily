import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AuthLayout from "../../../components/templates/auth-layout";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import UserStoryViewer from "../../../features/story/components/user-story-viewer";
import StoryGenerator from "../../../features/story/components/story-generator";
import GoalsSection from "../../../features/goals/components/goals-section";
import { generateProfilePageSchema } from "../../../lib/structured-data";

interface UserStoryPageProps {
  params: Promise<{ userId: string }>;
}

// Cached user query to deduplicate metadata and component queries
const getStoryUser = cache(async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      bio: true,
      image: true,
      currentRole: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
});

export const generateMetadata = async ({
  params,
}: UserStoryPageProps): Promise<Metadata> => {
  const { userId } = await params;
  const user = await getStoryUser(userId);

  if (!user) {
    return {
      title: "User Not Found",
      description: "The requested user could not be found.",
    };
  }

  const title = `${user.name}'s Growth Story`;
  const description = `View ${user.name}'s professional growth journey on Daiily. ${user._count.posts} posts shared.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/story/${userId}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
};

const UserStoryPage = async ({ params }: UserStoryPageProps) => {
  const { userId } = await params;

  // Fetch in parallel instead of sequentially
  const [currentUser, user] = await Promise.all([
    getCurrentUser(),
    getStoryUser(userId),
  ]);

  if (!user) {
    notFound();
  }

  const isOwnStory = currentUser?.id === userId;

  // Generate ProfilePage structured data for SEO
  const profilePageSchema = generateProfilePageSchema({
    name: user.name || "Unknown User",
    userId: user.id,
    bio: user.bio || undefined,
    image: user.image || undefined,
    currentRole: user.currentRole || undefined,
  });

  return (
    <AuthLayout>
      {/* ProfilePage Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <Link
                href="/feed"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Feed
              </Link>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-6 sm:py-8">
            {/* Profile Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-xl sm:text-2xl">
                    {user.name
                      ?.split(" ")
                      .map(n => n[0])
                      .join("") || "??"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 truncate">
                    {user.name || "Unknown User"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {isOwnStory ? "Your Growth Story" : "Growth Story"}
                  </p>
                </div>
              </div>
            </div>

            {/* Content based on ownership */}
            {isOwnStory ? (
              <>
                {/* Goals Section */}
                <div className="mb-6">
                  <GoalsSection />
                </div>

                {/* Story Generator with regenerate */}
                <StoryGenerator />
              </>
            ) : (
              /* Read-only story viewer for other users */
              <UserStoryViewer userId={userId} />
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default UserStoryPage;
