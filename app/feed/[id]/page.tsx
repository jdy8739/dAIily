import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Share2, Pencil, Bot } from "lucide-react";
import AuthLayout from "../../../components/templates/auth-layout";
import WriteNewEntryLink from "../../../components/atoms/write-new-entry-link";
import { getCurrentUser } from "../../../lib/auth";
import DeletePostButton from "../../../features/feed/components/molecules/delete-post-button";
import LikeButton from "../../../features/feed/components/molecules/like-button";
import ReplyForm from "../../../features/feed/components/molecules/reply-form";
import ReplyList from "../../../features/feed/components/molecules/reply-list";
import UserNameMenu from "../../../components/molecules/user-name-menu";
import { getPostById } from "../../../features/feed/lib/queries";
import ClientDate from "../../../components/atoms/client-date";
import { generateArticleSchema } from "../../../lib/structured-data";
import Badge from "../../../components/atoms/badge";

interface FeedDetailPageProps {
  params: Promise<{ id: string }>;
}

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
};

export const generateMetadata = async ({
  params,
}: FeedDetailPageProps): Promise<Metadata> => {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested post could not be found.",
    };
  }

  const title = `${post.title} by ${post.author.name || "Unknown"}`;
  const description = truncateText(post.content, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name || "Unknown"],
      url: `/feed/${post.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
};

const FeedDetailPage = async ({ params }: FeedDetailPageProps) => {
  const { id } = await params;

  // Fetch in parallel instead of sequentially
  const [currentUser, post] = await Promise.all([
    getCurrentUser(),
    getPostById(id),
  ]);

  if (!post) {
    notFound();
  }

  const isAuthor = currentUser?.id === post.author.id;
  const isAIStory = post.title.startsWith("[AI]");

  // Generate Article structured data for SEO
  const articleSchema = generateArticleSchema({
    title: post.title,
    content: post.content,
    authorName: post.author.name || "Unknown",
    authorId: post.author.id,
    publishedAt: post.createdAt,
    updatedAt: post.updatedAt,
    postId: post.id,
  });

  return (
    <AuthLayout>
      {/* Article Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
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
            {/* Post Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex-1">
                  {post.title}
                </h1>
                {isAIStory && (
                  <Badge variant="primary">
                    <Bot className="w-4 h-4" />
                    AI Story
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  By{" "}
                  <UserNameMenu
                    userId={post.author.id}
                    userName={post.author.name || "Unknown"}
                  />
                </span>
                <ClientDate date={post.createdAt} />
              </div>
            </div>

          {/* Post Content */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-8 mb-8">
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
                    <ClientDate date={post.createdAt} />
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
                  {/* Edit button - only for non-AI stories */}
                  {!isAIStory && (
                    <Link
                      href={`/feed/${post.id}/edit`}
                      className="px-3 py-1 text-sm text-muted-foreground hover:text-accent transition-colors rounded hover:bg-accent/10 cursor-pointer inline-flex items-center gap-1"
                      title="Edit post"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
                  )}
                  {/* Delete button - always available */}
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
                <MessageCircle className="w-4 h-4" />
                <span>
                  {post._count.replies}{" "}
                  {post._count.replies === 1 ? "Reply" : "Replies"}
                </span>
              </span>
              <button className="flex items-center space-x-2 text-muted-foreground hover:text-accent transition-colors cursor-pointer">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Replies Section */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
            <h4 className="text-lg font-semibold text-foreground mb-6">
              Replies ({post._count.replies})
            </h4>

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
          <div className="bg-gradient-to-br from-card via-card to-accent/5 rounded-2xl border border-border/30 p-8 shadow-lg text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Inspired by this story?
            </h3>
            <p className="text-muted-foreground mb-6">
              Share your own professional growth journey
            </p>
            <WriteNewEntryLink />
          </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default FeedDetailPage;
