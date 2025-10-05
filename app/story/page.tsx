import AuthLayout from "../../components/templates/auth-layout";
import StoryGenerator from "../../features/story/components/story-generator";

const StoryPage = async () => {
  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-accent to-info p-6 rounded-xl">
              <h1 className="text-3xl font-bold text-accent-foreground mb-2">
                Your Growth Story
              </h1>
              <p className="text-accent-foreground/90">
                AI-powered insights into your professional growth journey
              </p>
            </div>
          </div>

          <StoryGenerator />
        </div>
      </div>
    </AuthLayout>
  );
};

export default StoryPage;
