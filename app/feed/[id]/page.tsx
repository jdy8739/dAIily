import Link from "next/link";
import { notFound } from "next/navigation";
import AuthLayout from "../../../components/templates/auth-layout";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import DeletePostButton from "../../../features/feed/components/molecules/delete-post-button";

interface FeedDetailPageProps {
  params: Promise<{ id: string }>;
}

const FeedDetailPage = async ({ params }: FeedDetailPageProps) => {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const isAuthor = currentUser?.id === post.author.id;

  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-[calc(100vh-73px)]">
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
              <h1 className="text-3xl font-bold text-accent-foreground mb-2">
                {post.title}
              </h1>
              <div className="flex items-center space-x-2 text-accent-foreground/90">
                <span>By {post.author.firstName} {post.author.lastName}</span>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">
                    {post.author.firstName?.[0]}{post.author.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {post.author.firstName} {post.author.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Delete button - only show to author */}
              {isAuthor && (
                <DeletePostButton postId={post.id} />
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Engagement Actions */}
            <div className="flex items-center space-x-6 mt-8 pt-6 border-t border-border">
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors">
                <span>👍</span>
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors">
                <span>💬</span>
                <span>Comment</span>
              </button>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors">
                <span>🔄</span>
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Inspired by this story?
            </h3>
            <p className="text-muted-foreground mb-4">
              Share your own professional growth journey
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
    </AuthLayout>
  );
};

export default FeedDetailPage;