import Link from "next/link";
import { notFound } from "next/navigation";
import AuthLayout from "../../../components/templates/auth-layout";
import { getCurrentUser } from "../../../lib/auth";
import DeletePostButton from "../../../features/feed/components/molecules/delete-post-button";
import LikeButton from "../../../features/feed/components/molecules/like-button";
import ReplyForm from "../../../features/feed/components/molecules/reply-form";
import ReplyList from "../../../features/feed/components/molecules/reply-list";
import UserNameMenu from "../../../components/molecules/user-name-menu";
import { getPostById } from "../../../features/feed/lib/queries";

interface FeedDetailPageProps {
  params: Promise<{ id: string }>;
}

const FeedDetailPage = async ({ params }: FeedDetailPageProps) => {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const isAuthor = currentUser?.id === post.author.id;

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
              <h1 className="text-3xl font-bold text-accent-foreground mb-2">
                {post.title}
              </h1>
              <div className="flex items-center space-x-2 text-accent-foreground/90">
                <span>
                  By{" "}
                  <UserNameMenu
                    userId={post.author.id}
                    userName={post.author.name || "Unknown"}
                  />
                </span>
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
                    {post.author.name
                      ?.split(" ")
                      .map(n => n[0])
                      .join("") || "??"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {post.author.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleString()}
                    {post.updatedAt.getTime() !== post.createdAt.getTime() && (
                      <span className="ml-2 text-muted-foreground/70">
                        (edited)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Edit and Delete buttons - only show to author */}
              {isAuthor && (
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/feed/${post.id}/edit`}
                    className="px-3 py-1 text-sm text-muted-foreground hover:text-accent transition-colors rounded hover:bg-accent/10 cursor-pointer"
                    title="Edit post"
                  >
                    ✏️ Edit
                  </Link>
                  <DeletePostButton postId={post.id} />
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Engagement Actions */}
            <div className="flex items-center space-x-6 mt-8 pt-6 border-t border-border">
              <LikeButton
                postId={post.id}
                initialLiked={
                  currentUser
                    ? post.likes.some(like => like.userId === currentUser.id)
                    : false
                }
                initialLikeCount={post._count.likes}
              />
              <span className="flex items-center space-x-2 text-muted-foreground">
                <span>💬</span>
                <span>
                  {post._count.replies}{" "}
                  {post._count.replies === 1 ? "Reply" : "Replies"}
                </span>
              </span>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                <span>🔄</span>
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Replies Section */}
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Replies ({post._count.replies})
            </h3>

            {/* Reply Form - only show to logged in users */}
            {currentUser && (
              <div className="mb-8">
                <ReplyForm postId={post.id} />
              </div>
            )}

            {/* Replies List */}
            <ReplyList
              replies={post.replies.map(reply => ({
                ...reply,
                createdAt: reply.createdAt.toISOString(),
                updatedAt: reply.updatedAt.toISOString(),
              }))}
              currentUserId={currentUser?.id}
              postAuthorId={post.author.id}
            />
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
