import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AuthLayout from "../../../../components/templates/auth-layout";
import WriteNewEntryLink from "../../../../components/atoms/write-new-entry-link";
import Tabs from "../../../../components/atoms/tabs";
import {
  getUserById,
  getUserPosts,
} from "../../../../features/feed/lib/queries";
import { loadMoreUserPosts } from "../../../../features/feed/lib/actions";
import UserFeedList from "../../../../features/feed/components/organisms/user-feed-list";
import ClientDate from "../../../../components/atoms/client-date";
import { generateProfilePageSchema } from "../../../../lib/structured-data";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

export const generateMetadata = async ({
  params,
}: UserProfilePageProps): Promise<Metadata> => {
  const { userId } = await params;
  const user = await getUserById(userId);

  if (!user) {
    return {
      title: "User Not Found",
      description: "The requested user could not be found.",
    };
  }

  const title = `${user.name}'s Posts`;
  const roleInfo =
    user.currentRole && user.industry
      ? `${user.currentRole} in ${user.industry}`
      : user.currentRole || user.industry || "Professional";
  const description = `View all posts from ${user.name} - ${roleInfo}. Follow their professional growth journey on Daiily.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/feed/user/${userId}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
};

const UserProfilePage = async ({ params }: UserProfilePageProps) => {
  const { userId } = await params;

  // Fetch user and their posts
  const [user, posts] = await Promise.all([
    getUserById(userId),
    getUserPosts(userId),
  ]);

  if (!user) {
    notFound();
  }

  // Calculate stats
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + post._count.likes, 0);
  const totalReplies = posts.reduce(
    (sum, post) => sum + post._count.replies,
    0
  );

  // Feed tab content
  const feedContent = (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {totalPosts}
          </div>
          <div className="text-secondary">Posts</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {totalLikes}
          </div>
          <div className="text-secondary">Likes Received</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {totalReplies}
          </div>
          <div className="text-secondary">Replies Received</div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">
          All Posts
        </h3>
        {posts.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground text-lg">No posts yet</p>
            </div>

            {/* Write CTA */}
            <div className="bg-gradient-to-br from-card via-card to-accent/5 rounded-2xl border border-border/30 p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Share Your Professional Journey
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Document your growth, insights, and achievements. Your story
                    inspires others!
                  </p>
                </div>
                <WriteNewEntryLink />
              </div>
            </div>
          </div>
        ) : (
          <UserFeedList
            initialPosts={posts}
            loadMore={loadMoreUserPosts.bind(null, userId)}
          />
        )}
      </div>
    </div>
  );

  // About tab content
  const aboutContent = (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          About {user.name}
        </h3>
        <div className="space-y-3 text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Member since:</span>{" "}
            <ClientDate date={user.createdAt} />
          </div>
          {user.currentRole && (
            <div>
              <span className="font-medium text-foreground">Current Role:</span>{" "}
              {user.currentRole}
            </div>
          )}
          {user.industry && (
            <div>
              <span className="font-medium text-foreground">Industry:</span>{" "}
              {user.industry}
            </div>
          )}
        </div>
      </div>

      {user.currentGoals && user.currentGoals.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Current Goals
          </h3>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            {user.currentGoals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const tabItems = [
    {
      id: "feed",
      label: "Feed",
      content: feedContent,
    },
    {
      id: "about",
      label: "About",
      content: aboutContent,
    },
  ];

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
                    {user.currentRole && user.industry
                      ? `${user.currentRole} in ${user.industry}`
                      : user.currentRole || user.industry || "Professional"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabbed Content */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-8">
              <Tabs items={tabItems} defaultTab="feed" queryParam="tab" />
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default UserProfilePage;
