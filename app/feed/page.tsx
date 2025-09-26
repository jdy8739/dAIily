import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";

const FeedPage = async () => {
  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-accent to-info p-6 rounded-xl mb-8">
          <h1 className="text-3xl font-bold text-accent-foreground mb-2">
            Growth Feed
          </h1>
          <p className="text-accent-foreground/90">
            Discover and be inspired by others' professional journeys
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  JS
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-foreground">John Smith</h3>
                  <span className="text-sm text-muted-foreground">
                    Software Engineer at TechCorp
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">2h ago</span>
                </div>
                <h4 className="font-medium text-foreground mb-2">
                  Shipped my first microservice architecture
                </h4>
                <p className="text-muted-foreground mb-3">
                  Today I successfully deployed a new microservice that handles user notifications.
                  The biggest learning was understanding how to properly implement circuit breakers
                  and handle graceful degradation. This project taught me so much about distributed systems!
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <button className="hover:text-accent transition-colors">👍 12</button>
                  <button className="hover:text-accent transition-colors">💬 3</button>
                  <button className="hover:text-accent transition-colors">🔄 Share</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                <span className="text-success-foreground font-semibold text-sm">
                  MJ
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-foreground">Maria Johnson</h3>
                  <span className="text-sm text-muted-foreground">
                    Product Manager at StartupCo
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">4h ago</span>
                </div>
                <h4 className="font-medium text-foreground mb-2">
                  Led my first cross-team sprint planning
                </h4>
                <p className="text-muted-foreground mb-3">
                  Facilitated a planning session with 3 different teams today. Initially nervous,
                  but it went amazingly well! Key insight: asking the right questions is more
                  important than having all the answers. The teams aligned on priorities and
                  everyone left energized.
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <button className="hover:text-accent transition-colors">👍 8</button>
                  <button className="hover:text-accent transition-colors">💬 5</button>
                  <button className="hover:text-accent transition-colors">🔄 Share</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-info rounded-full flex items-center justify-center">
                <span className="text-info-foreground font-semibold text-sm">
                  DL
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-foreground">David Lee</h3>
                  <span className="text-sm text-muted-foreground">
                    UX Designer at DesignStudio
                  </span>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">1d ago</span>
                </div>
                <h4 className="font-medium text-foreground mb-2">
                  Completed my first user research study
                </h4>
                <p className="text-muted-foreground mb-3">
                  Interviewed 15 users about their experience with our mobile app.
                  Eye-opening to see how differently people interpret our designs!
                  The biggest surprise: users wanted MORE information on the main screen,
                  not less. This completely changed our minimalist approach.
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <button className="hover:text-accent transition-colors">👍 15</button>
                  <button className="hover:text-accent transition-colors">💬 7</button>
                  <button className="hover:text-accent transition-colors">🔄 Share</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Ready to share your growth story?
            </h3>
            <p className="text-muted-foreground mb-4">
              Join the conversation and inspire others with your professional journey
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
      </div>
    </AuthLayout>
  );
};

export default FeedPage;