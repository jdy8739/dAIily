import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";

const StoryPage = () => {
  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-accent to-info p-6 rounded-xl">
              <h1 className="text-3xl font-bold text-accent-foreground mb-2">
                Story
              </h1>
              <p className="text-accent-foreground/90">
                Your professional growth journey, analyzed and summarized
              </p>
            </div>
          </div>

          {/* Coming Soon Content */}
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-12 text-center">
            <div className="max-w-md mx-auto">
              {/* Icon */}
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📊</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Coming Soon
              </h2>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We&apos;re working on something amazing! Soon you&apos;ll be able to see AI-powered insights
                of your professional growth journey across different time periods.
              </p>

              {/* Features Preview */}
              <div className="bg-muted/30 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-foreground mb-3">What&apos;s Coming:</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-center space-x-2">
                    <span>📈</span>
                    <span>AI-powered growth analysis</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>📅</span>
                    <span>Daily, weekly, monthly, yearly summaries</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>Achievement highlights and patterns</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span>💡</span>
                    <span>Personalized growth insights</span>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <p className="text-sm text-muted-foreground">
                Keep sharing your professional journey in the{" "}
                <Link href="/feed" className="text-primary hover:text-primary/80 transition-colors">
                  Feed
                </Link>{" "}
                to unlock powerful insights when this feature launches!
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default StoryPage;