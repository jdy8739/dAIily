import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";
import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/auth";
import LikeButton from "../../features/feed/components/molecules/like-button";

const FeedPage = async () => {
  const currentUser = await getCurrentUser();

  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-accent to-info p-6 rounded-xl mb-8">
            <h1 className="text-3xl font-bold text-accent-foreground mb-2">
              Growth Feed
            </h1>
            <p className="text-accent-foreground/90">
              Discover and be inspired by others' professional journeys
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
              posts.map(post => (
                <Link key={post.id} href={`/feed/${post.id}`} className="block">
                  <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6 hover:shadow-md hover:border-accent/50 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-semibold text-sm">
                          {post.author.name?.split(' ').map(n => n[0]).join('') || '??'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-foreground">
                            {post.author.name}
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            •
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <LikeButton
                            postId={post.id}
                            initialLiked={
                              currentUser
                                ? post.likes.some(
                                    like => like.userId === currentUser.id
                                  )
                                : false
                            }
                            initialLikeCount={post._count.likes}
                          />
                          <span className="hover:text-accent transition-colors">
                            💬 {post._count.replies}
                          </span>
                          <span className="hover:text-accent transition-colors">
                            🔄 Share
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Ready to share your growth story?
              </h3>
              <p className="text-muted-foreground mb-4">
                Join the conversation and inspire others with your professional
                journey
              </p>
              <Link
                href="/write"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Write Your Entry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default FeedPage;
