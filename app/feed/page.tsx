import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";
import { getCurrentUser } from "../../lib/auth";
import { getFeedPosts } from "../../features/feed/lib/queries";
import { loadMoreFeedPosts } from "../../features/feed/lib/actions";
import FeedList from "../../features/feed/components/organisms/feed-list";

const FeedPage = async () => {
  const currentUser = await getCurrentUser();
  const posts = await getFeedPosts();

  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-accent to-info p-6 rounded-xl mb-8">
            <h1 className="text-3xl font-bold text-accent-foreground mb-2">
              Growth Feed
            </h1>
            <p className="text-accent-foreground/90">
              Discover and be inspired by others&apos; professional journeys
            </p>
          </div>

          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-8 text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share your professional growth journey!
                </p>
                <Link
                  href="/write"
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Write Your First Entry
                </Link>
              </div>
            ) : (
              <FeedList
                initialPosts={posts}
                currentUserId={currentUser?.id || null}
                loadMore={loadMoreFeedPosts}
              />
            )}

            {currentUser && (
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Check out your own posts and activity
                </p>
                <Link
                  href={`/feed/user/${currentUser.id}?tab=feed`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
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
