import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import AuthLayout from "../../../../components/templates/auth-layout";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import EditPostForm from "../../../../features/feed/components/organisms/edit-post-form";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

const EditPostPage = async ({ params }: EditPostPageProps) => {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Only allow post author to edit
  if (post.authorId !== currentUser.id) {
    redirect(`/feed/${id}`);
  }

  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/feed/${id}`}
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
            >
              ← Back to Post
            </Link>
            <div className="bg-gradient-to-r from-accent to-info p-6 rounded-xl">
              <h1 className="text-3xl font-bold text-accent-foreground mb-2">
                Edit Your Post
              </h1>
              <p className="text-accent-foreground/90">
                Update your professional growth story
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-8">
            <EditPostForm
              postId={post.id}
              initialTitle={post.title}
              initialContent={post.content}
            />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default EditPostPage;
