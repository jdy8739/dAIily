import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import AuthLayout from "../../../../components/templates/auth-layout";
import { getCurrentUser } from "../../../../lib/auth";
import EditPostForm from "../../../../features/feed/components/organisms/edit-post-form";
import { getPostForEdit } from "../../../../features/feed/lib/queries";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

const EditPostPage = async ({ params }: EditPostPageProps) => {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const post = await getPostForEdit(id);

  if (!post) {
    notFound();
  }

  // Only allow post author to edit
  if (post.authorId !== currentUser.id) {
    redirect(`/feed/${id}`);
  }

  // Prevent editing of AI-generated stories
  const isAIStory = post.title.startsWith("[AI]");
  if (isAIStory) {
    redirect(`/feed/${id}`);
  }

  return (
    <AuthLayout>
      <div className="min-h-[calc(100vh-73px)] bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <Link
                href={`/feed/${id}`}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Post
              </Link>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Edit Your Post
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Update your professional growth story
              </p>
            </div>

            {/* Edit Form */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-8">
              <EditPostForm
                postId={post.id}
                initialTitle={post.title}
                initialContent={post.content}
                isDraft={post.status === "DRAFT"}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EditPostPage;
