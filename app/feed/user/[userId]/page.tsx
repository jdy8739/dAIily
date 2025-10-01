import Link from "next/link";
import { notFound } from "next/navigation";
import AuthLayout from "../../../../components/templates/auth-layout";
import Tabs from "../../../../components/atoms/tabs";
import { prisma } from "../../../../lib/prisma";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

const UserProfilePage = async ({ params }: UserProfilePageProps) => {
  const { userId } = await params;

  // Fetch user with their posts
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Calculate stats
  const totalPosts = user.posts.length;
  const totalLikes = user.posts.reduce((sum, post) => sum + post._count.likes, 0);
  const totalReplies = user.posts.reduce(
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
        {user.posts.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No posts yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {user.posts.map((post) => (
              <Link
                key={post.id}
                href={`/feed/${post.id}`}
                className="block p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-all"
              >
                <h4 className="font-semibold text-foreground mb-2">
                  {post.title}
                </h4>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {post.content}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span>❤️ {post._count.likes}</span>
                  <span>💬 {post._count.replies}</span>
                </div>
              </Link>
            ))}
          </div>
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
          {user.firm && (
            <div>
              <span className="font-medium text-foreground">Company:</span>{" "}
              {user.firm}
            </div>
          )}
          {user.role && (
            <div>
              <span className="font-medium text-foreground">Role:</span>{" "}
              {user.role}
            </div>
          )}
        </div>
      </div>

      {user.careerGoals && (
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Career Goals
          </h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {user.careerGoals}
          </p>
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
                    {user.name?.split(" ").map((n) => n[0]).join("") || "??"}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-accent-foreground">
                    {user.name}
                  </h1>
                  <p className="text-accent-foreground/90">
                    {user.firm && user.role
                      ? `${user.role} at ${user.firm}`
                      : user.firm || user.role || "Professional"}
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
