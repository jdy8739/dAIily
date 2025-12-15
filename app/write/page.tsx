import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";
import PostForm from "../../features/feed/components/organisms/post-form";

const WritePage = async () => {
  return (
    <AuthLayout>
      <div className="min-h-[calc(100vh-73px)] bg-background">
        <div className="max-w-4xl mx-auto">
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
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Share Your Daily Growth
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Record your professional achievements and learnings
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-border">
              <div className="px-6 py-8">
                <PostForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default WritePage;
