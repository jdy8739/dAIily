import AuthLayout from "../../components/templates/auth-layout";
import PostForm from "../../features/feed/components/organisms/post-form";

const WritePage = async () => {
  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-success/20 via-accent/10 to-primary/20 min-h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-success to-accent p-6 rounded-xl mb-8">
          <h1 className="text-3xl font-bold text-success-foreground mb-2 text-foreground">
            Share Your Daily Growth
          </h1>
          <p className="text-success-foreground/90">
            Record your professional achievements and learnings
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-primary/30">
          <div className="px-6 py-8">
            <PostForm />
          </div>
        </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default WritePage;
