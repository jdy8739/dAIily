import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AuthLayout from "../../../components/templates/auth-layout";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import UserStoryViewer from "../../../features/story/components/user-story-viewer";
import StoryGenerator from "../../../features/story/components/story-generator";
import GoalsSection from "../../../features/goals/components/goals-section";

interface UserStoryPageProps {
  params: Promise<{ userId: string }>;
}

export const generateMetadata = async ({
  params,
}: UserStoryPageProps): Promise<Metadata> => {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });

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
  const currentUser = await getCurrentUser();

  // Fetch user with basic info only
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    notFound();
  }

  const isOwnStory = currentUser?.id === userId;

  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/feed"
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
            >
              ← Back to Feed
            </Link>
            <div className="bg-gradient-to-r from-accent to-info p-6 rounded-xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-xl">
                    {user.name
                      ?.split(" ")
                      .map(n => n[0])
                      .join("") || "??"}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-accent-foreground">
                    {isOwnStory
                      ? "Your Growth Story"
                      : `${user.name}'s Growth Story`}
                  </h1>
                  <p className="text-accent-foreground/90">
                    AI-powered insights into {isOwnStory ? "your" : "their"}{" "}
                    professional journey
                  </p>
                </div>
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
    </AuthLayout>
  );
};

export default UserStoryPage;
