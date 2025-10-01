import Link from "next/link";
import { notFound } from "next/navigation";
import AuthLayout from "../../../components/templates/auth-layout";
import { prisma } from "../../../lib/prisma";

interface UserStoryPageProps {
  params: Promise<{ userId: string }>;
}

const UserStoryPage = async ({ params }: UserStoryPageProps) => {
  const { userId } = await params;

  // Fetch user with basic info only
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    notFound();
  }

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
                    {user.name?.split(' ').map(n => n[0]).join('') || '??'}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-accent-foreground">
                    {user.name}
                  </h1>
                  <p className="text-accent-foreground/90">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements Coming Soon */}
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-12 text-center">
            <div className="max-w-md mx-auto">
              {/* Icon */}
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏆</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Achievements Coming Soon
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We&apos;re working on an amazing achievement system! Soon you&apos;ll be
                able to see badges, milestones, and growth analytics.
              </p>

              {/* Features Preview */}
              <div className="bg-muted/30 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-foreground mb-3">
                  What&apos;s Coming:
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <span>🏅</span>
                    <span>Achievement badges and milestones</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>📊</span>
                    <span>Growth analytics and insights</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>Goal tracking and progress</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>⭐</span>
                    <span>Skill development tracking</span>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <p className="text-sm text-muted-foreground mb-4">
                Want to see their posts and activity?
              </p>
              <Link
                href={`/feed/user/${userId}?tab=feed`}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                View Their Feed
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default UserStoryPage;
