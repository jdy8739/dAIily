import Link from "next/link";
import { notFound } from "next/navigation";
import AuthLayout from "../../../../components/templates/auth-layout";
import Tabs from "../../../../components/atoms/tabs";
import {
  getUserById,
  getUserPosts,
} from "../../../../features/feed/lib/queries";
import { loadMoreUserPosts } from "../../../../features/feed/lib/actions";
import UserFeedList from "../../../../features/feed/components/organisms/user-feed-list";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

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
          <div className="text-muted-foreground">Posts</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {totalLikes}
          </div>
          <div className="text-muted-foreground">Likes Received</div>
        </div>
        <div className="bg-muted/30 rounded-lg p-6 text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {totalReplies}
          </div>
          <div className="text-muted-foreground">Replies Received</div>
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
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-info/10 border-2 border-primary/20 rounded-xl p-6 hover:border-primary/40 transition-all">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Share Your Professional Journey
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Document your growth, insights, and achievements. Your story inspires others!
                  </p>
                </div>
                <Link
                  href="/write"
                  className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 hover:scale-105 transition-all shadow-md whitespace-nowrap"
                >
                  ✍️ Write New Entry
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <UserFeedList
            initialPosts={posts}
            loadMore={async (page) => await loadMoreUserPosts(userId, page)}
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
            {new Date(user.createdAt).toLocaleDateString()}
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
              <div className="flex items-center space-x-4">
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
                    {user.name}
                  </h1>
                  <p className="text-accent-foreground/90">
                    {user.currentRole && user.industry
                      ? `${user.currentRole} in ${user.industry}`
                      : user.currentRole || user.industry || "Professional"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Content */}
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-8">
            <Tabs items={tabItems} defaultTab="feed" queryParam="tab" />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default UserProfilePage;
