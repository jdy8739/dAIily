import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";
import { getCurrentUser } from "../../lib/auth";
import { getFeedPosts } from "../../features/feed/lib/queries";
import { loadMoreFeedPosts } from "../../features/feed/lib/actions";
import FeedList from "../../features/feed/components/organisms/feed-list";

const FeedPage = async () => {
  // Fetch in parallel instead of sequentially
  const [currentUser, posts] = await Promise.all([
    getCurrentUser(),
    getFeedPosts(),
  ]);

  return (
    <AuthLayout>
      <div className="min-h-[calc(100vh-56px)]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="title-3 text-foreground mb-2">Growth Feed</h1>
            <p className="text-muted-foreground text-sm">
              Discover and be inspired by others&apos; professional journeys
            </p>
          </div>

          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-card rounded-lg border border-border/50 p-8 text-center">
                <h3 className="text-base font-medium text-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Be the first to share your professional growth journey!
                </p>
                <Link
                  href="/write"
                  className="inline-flex items-center h-8 px-3 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors text-sm font-medium"
                >
                  Write Your First Entry
                </Link>
              </div>
            ) : (
              <FeedList initialPosts={posts} loadMore={loadMoreFeedPosts} />
            )}

            {currentUser && (
              <div className="bg-card border border-border/50 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Check out your own posts and activity
                </p>
                <Link
                  href={`/feed/user/${currentUser.id}?tab=feed`}
                  className="inline-flex items-center h-8 px-3 bg-foreground text-background rounded-md hover:bg-foreground/90 transition-colors text-sm font-medium"
                >
                  View My Posts
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default FeedPage;
