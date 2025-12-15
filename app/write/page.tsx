import AuthLayout from "../../components/templates/auth-layout";
import PostForm from "../../features/feed/components/organisms/post-form";

const WritePage = async () => {
  return (
    <AuthLayout>
      <div className="min-h-[calc(100vh-73px)] bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-border">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Share Your Daily Growth
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Record your professional achievements and learnings
            </p>
          </div>

          <div className="px-4 sm:px-6 py-6 sm:py-8">
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
